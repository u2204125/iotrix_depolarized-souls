"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import LiveFeed from "./components/LiveFeed"
import DecisionTerminal from "./components/DecisionTerminal"
import StatsRow from "./components/StatsRow"
import PageHead from "./components/PageHead"

import { auth } from "../../firebaseConfig"
import { signOut } from 'firebase/auth'
import { toast } from 'react-toastify'
import {
  getDatabase,
  ref,
  onValue,
  get,
  runTransaction,
  set,
  update,
} from "firebase/database"
import { onAuthStateChanged } from "firebase/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [profile, setProfile] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [liveSession, setLiveSession] = useState(null)
  const [student, setStudent] = useState(null)
  const [stats, setStats] = useState({ total_served_today: 0, fraud_attempts: 0, uptime: "—" })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!auth) {
      // If firebase isn't initialized, redirect to login
      router.push('/login')
      return
    }

    const db = getDatabase()
    let statsUnsub = null
    let liveUnsub = null

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        // fetch profile
        const profileSnap = await get(ref(db, `users/${user.uid}`))
        const profileVal = profileSnap.exists() ? profileSnap.val() : null
        if (!profileVal || profileVal.role !== 'manager') {
          // Not authorized -> redirect to login with an error query so LoginForm shows a toast
          router.push('/?error=access_denied')
          return
        }

        setProfile(profileVal)

        // Initialize and listen to stats
        const statsRef = ref(db, 'stats/daily_report')
        // Ensure counters exist (set to 0 if null)
        await runTransaction(ref(db, 'stats/daily_report/total_served_today'), (current) => (current === null ? 0 : current))
        await runTransaction(ref(db, 'stats/daily_report/fraud_attempts'), (current) => (current === null ? 0 : current))

        statsUnsub = onValue(statsRef, (snap) => {
          const s = snap.val() || {}
          setStats({
            total_served_today: s.total_served_today || 0,
            fraud_attempts: s.fraud_attempts || 0,
            uptime: s.uptime || '—',
          })
        })

        // Listen to live_session
        const liveRef = ref(db, 'live_session')
        liveUnsub = onValue(liveRef, async (snap) => {
          const ls = snap.val()
          setLiveSession(ls)
          if (!ls) {
            setStudent(null)
            return
          }

          // If live_session contains uid, fetch that user's profile
          const uid = ls.uid || ls.studentUid || (ls.student && ls.student.uid)
          if (uid) {
            const studentSnap = await get(ref(db, `users/${uid}`))
            setStudent(studentSnap.exists() ? studentSnap.val() : null)
          } else if (ls.student) {
            setStudent(ls.student)
          } else {
            setStudent(null)
          }
        })

        setChecking(false)
      } catch (err) {
        console.error('Dashboard auth/init error', err)
        router.push('/login?error=access_denied')
      }
    })

    return () => {
      unsubAuth()
      if (statsUnsub) statsUnsub()
      if (liveUnsub) liveUnsub()
    }
  }, [router])

  const handleLogout = React.useCallback(async () => {
    try {
      if (!auth) {
        router.push('/login')
        return
      }
      await signOut(auth)
      toast.success('Logged out')
    } catch (err) {
      console.error('Logout error', err)
      toast.error('Logout failed')
    } finally {
      router.push('/login')
    }
  }, [router])

  // Approve handler: deduct ৳50, mark has_eaten_today, open door, increment served stat
  const handleApprove = useCallback(async () => {
    if (!student || !student.uid) return
    setActionLoading(true)
    const db = getDatabase()
    try {
      // Transaction on student to ensure eligibility and deduct balance atomically
      const userRef = ref(db, `users/${student.uid}`)
      const result = await runTransaction(userRef, (current) => {
        if (current === null) return
        if (current.has_eaten_today) return
        if ((current.balance || 0) < 50) return
        current.balance = (current.balance || 0) - 50
        current.has_eaten_today = true
        return current
      })

      if (!result.committed) {
        // Determine reason
        const cur = result.snapshot.val() || {}
        let reason = 'Transaction failed'
        if (cur.has_eaten_today) reason = 'ALREADY_SERVED'
        else if ((cur.balance || 0) < 50) reason = 'INSUFFICIENT_FUNDS'
        toast.error(`Approve failed: ${reason}`)
        setActionLoading(false)
        return
      }

      // Open the door (hardware)
      await set(ref(db, 'hardware/door_lock'), 'OPEN')

      // Increment served counter
      await runTransaction(ref(db, 'stats/daily_report/total_served_today'), (current) => (current || 0) + 1)

      // Optionally push a log to /live_session or /logs
      await set(ref(db, `live_session/last_action`), { type: 'approve', uid: student.uid, at: Date.now(), by: profile?.uid || 'manager' })

      toast.success('Approved — door opened')
    } catch (err) {
      console.error('handleApprove error', err)
      toast.error('Approve failed: ' + (err.message || String(err)))
    } finally {
      setActionLoading(false)
    }
  }, [student, profile])

  // Deny handler: increment fraud attempts, set buzzer
  const handleDeny = useCallback(async () => {
    if (!student || !student.uid) return
    setActionLoading(true)
    const db = getDatabase()
    try {
      await runTransaction(ref(db, 'stats/daily_report/fraud_attempts'), (current) => (current || 0) + 1)
      await set(ref(db, 'hardware/buzzer'), 'BEEP')
      await set(ref(db, `live_session/last_action`), { type: 'deny', uid: student.uid, at: Date.now(), by: profile?.uid || 'manager' })
    } catch (err) {
      console.error('handleDeny error', err)
      toast.error('Deny failed: ' + (err.message || String(err)))
    } finally {
      setActionLoading(false)
    }
  }, [student, profile])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="text-center">
          <div className="mb-4 animate-spin border-4 border-t-transparent border-slate-300 rounded-full w-12 h-12 mx-auto" />
          <div>Checking authorization...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <PageHead />
      <div className="flex">
        <Sidebar onToggle={() => setSidebarOpen((s) => !s)} onLogout={handleLogout} />

        <div className="flex-1 min-h-screen md:pl-72">
          <Header mockUser={profile || { name: 'Manager' }} onMenu={() => setSidebarOpen(true)} onLogout={handleLogout} />

          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LiveFeed />
              <DecisionTerminal student={student} active={!!student} onApprove={handleApprove} onDeny={handleDeny} />
            </div>

            <StatsRow stats={stats} />
          </main>
        </div>
      </div>
    </div>
  )
}
