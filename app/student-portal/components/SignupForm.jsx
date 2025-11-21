"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Loader, ArrowRight } from 'lucide-react'

function Spinner() { return <Loader className="animate-spin h-5 w-5 text-white" /> }

export default function SignupForm({ onSuccess }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/students/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data && data.error ? data.error : 'Signup failed'
        setError(msg)
        return
      }
      const user = data.user
      try { localStorage.setItem('student_user', JSON.stringify(user)) } catch (e) {}
      onSuccess && onSuccess(user)
      router.push('/student-portal/dashboard')
    } catch (err) {
      setError(err && err.message ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-6 py-6">
      <div className="bg-white/4 border border-white/6 rounded-2xl p-6 backdrop-blur-md">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create Student Account</h1>
          <p className="text-sm text-slate-300 mt-1">Signup to access the student portal</p>
        </div>

        {error && <div className="mb-3 rounded-md bg-red-900/70 border border-red-700 px-4 py-2 text-sm text-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="sr-only" htmlFor="name">Full name</label>
            <div className="flex items-center gap-3 bg-white/3 px-3 py-2 rounded-lg border border-white/6">
              <User className="w-5 h-5 text-slate-300" />
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" className="bg-transparent outline-none text-slate-100 placeholder:text-slate-400 w-full" />
            </div>
          </div>

          <div>
            <label className="sr-only" htmlFor="email">Email</label>
            <div className="flex items-center gap-3 bg-white/3 px-3 py-2 rounded-lg border border-white/6">
              <Mail className="w-5 h-5 text-slate-300" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" className="bg-transparent outline-none text-slate-100 placeholder:text-slate-400 w-full" />
            </div>
          </div>

          <div>
            <label className="sr-only" htmlFor="password">Password</label>
            <div className="flex items-center gap-3 bg-white/3 px-3 py-2 rounded-lg border border-white/6">
              <Lock className="w-5 h-5 text-slate-300" />
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Choose a password" className="bg-transparent outline-none text-slate-100 placeholder:text-slate-400 w-full" />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 text-sm font-semibold shadow-md hover:brightness-105 disabled:opacity-60">
              {loading ? <Spinner /> : <ArrowRight className="w-4 h-4" />}
              <span>{loading ? 'Signing up...' : 'Create Account'}</span>
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">Already have an account? <a className="text-rose-300 hover:underline" href="/student-portal/login">Sign in</a></div>
      </div>
    </div>
  )
}
