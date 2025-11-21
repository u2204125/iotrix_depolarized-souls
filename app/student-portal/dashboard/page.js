"use client"
import React, { useEffect, useState } from 'react'
import StudentSidebar from '../components/Sidebar'
import StudentHeader from '../components/Header'
import StudentPageHead from '../components/PageHead'

export default function StudentDashboardPage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('student_user'))
      setUser(stored)
    } catch (e) {
      setUser(null)
    }
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <StudentPageHead />
        <div className="flex">
          <StudentSidebar />
          <div className="flex-1 min-h-screen md:pl-72">
            <StudentHeader />
            <main className="max-w-3xl mx-auto px-4 py-12">
              <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-md border border-white/5">
                <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
                <div>Please login first. <a href="/student-portal/login" className="text-rose-400 underline">Login</a></div>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <StudentPageHead />
      <div className="flex">
        <StudentSidebar />
        <div className="flex-1 min-h-screen md:pl-72">
          <StudentHeader mockUser={user} />
          <main className="max-w-5xl mx-auto px-4 py-12">
            <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-md border border-white/5">
              <h2 className="text-xl font-semibold mb-4">Welcome, {user.name}</h2>
              <p className="text-slate-300 mb-4">Email: {user.email}</p>
              <p className="text-slate-400">RFID: <span className="text-slate-200">{user.rfid_tag}</span></p>
              <div className="mt-6">
                <a href="/student-portal/purchase" className="px-3 py-2 rounded bg-rose-500 text-white">Purchase Tokens</a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
