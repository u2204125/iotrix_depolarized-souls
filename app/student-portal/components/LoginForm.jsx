"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader, ArrowRight, ArrowLeft } from 'lucide-react'

function Spinner() { return <Loader className="animate-spin h-5 w-5 text-white" /> }

export default function LoginForm({ onSuccess }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data && data.error ? data.error : 'Failed to sign in.'
        setError(msg)
        return
      }
      const user = data.user
      // persist demo session
      try { localStorage.setItem('student_user', JSON.stringify(user)) } catch (e) {}
      onSuccess && onSuccess(user)
      router.push('/student-portal/dashboard')
    } catch (err) {
      setError(err && err.message ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendReset(e) {
    e && e.preventDefault()
    setResetMessage('')
    setResetLoading(true)
    setError('')
    try {
      // No reset endpoint for demo — show informational message
      const to = resetEmail || email
      if (!to) throw new Error('Please provide an email address to reset.')
      // Simulate sending
      await new Promise((r) => setTimeout(r, 700))
      setResetMessage('Password reset is not available in demo; contact administrator.')
      setForgotOpen(false)
    } catch (err) {
      setError(err && err.message ? err.message : 'Failed to send reset')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-6 py-6">
      <div className="relative bg-white/4 border border-white/6 rounded-2xl p-6 backdrop-blur-md">
        <div className={`flex w-[200%] transition-transform duration-500 ${forgotOpen ? '-translate-x-1/2' : 'translate-x-0'}`}>
          <div className="w-1/2 p-4">
            <div className="mb-4 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Student Portal</h1>
              <p className="text-sm text-slate-300 mt-1">Sign in to manage your account</p>
            </div>

            {error && <div className="mb-3 rounded-md bg-red-900/70 border border-red-700 px-4 py-2 text-sm text-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="sr-only" htmlFor="email">Email</label>
                <div className="flex items-center gap-3 bg-white/3 px-3 py-2 rounded-lg border border-white/6">
                  <Mail className="w-5 h-5 text-slate-300" />
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="bg-transparent outline-none text-slate-100 placeholder:text-slate-400 w-full" />
                </div>
              </div>

              <div>
                <label className="sr-only" htmlFor="password">Password</label>
                <div className="relative flex items-center gap-3 bg-white/3 px-3 py-2 rounded-lg border border-white/6">
                  <Lock className="w-5 h-5 text-slate-300" />
                  <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="bg-transparent outline-none text-slate-100 placeholder:text-slate-400 w-full pr-10" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-300 hover:bg-white/6" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 text-sm font-semibold shadow-md hover:brightness-105 disabled:opacity-60">
                  {loading ? <Spinner /> : <ArrowRight className="w-4 h-4" />}
                  <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                </button>
              </div>
            </form>

            <div className="mt-4 text-center text-xs text-slate-400">Don’t have an account? <a className="text-rose-300 hover:underline" href="/student-portal/signup">Sign up</a></div>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-slate-500">© IOTrix • Student Portal Demo</div>
    </div>
  )
}
