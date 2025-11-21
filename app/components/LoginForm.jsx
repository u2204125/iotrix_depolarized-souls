"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { Mail, Lock, Eye, EyeOff, Loader, ArrowRight, ArrowLeft } from 'lucide-react'
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../../firebaseConfig'

function Spinner() {
  return <Loader className="animate-spin h-5 w-5 text-white" />
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
  

  useEffect(() => {
    try {
      const err = searchParams?.get('error')
      if (err === 'access_denied') {
        // show toast and clean up URL
        toast.error('Access denied — you must sign in as a manager to view that page.')
        if (typeof window !== 'undefined' && window.history && window.location) {
          const url = new URL(window.location.href)
          url.searchParams.delete('error')
          window.history.replaceState({}, document.title, url.toString())
        }
      }
    } catch (e) {
      // ignore
    }
  }, [searchParams])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!auth) throw new Error('Firebase not initialized')
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Signed in')
      router.push('/dashboard')
    } catch (err) {
      let message = 'Failed to sign in. Please check your credentials.'
      if (err && err.code) {
        if (err.code === 'auth/user-not-found') message = 'No user found with this email.'
        else if (err.code === 'auth/wrong-password') message = 'Incorrect password.'
        else if (err.code === 'auth/invalid-email') message = 'Invalid email address.'
      }
      if (err && err.message) message = err.message
      setError(message)
      toast.error(message)
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
      if (!auth) throw new Error('Firebase not initialized')
      const emailToSend = resetEmail || email
      if (!emailToSend) throw new Error('Please provide an email address to reset.')
      await sendPasswordResetEmail(auth, emailToSend)
      setResetMessage('Password reset email sent. Check your inbox.')
      setForgotOpen(false)
      toast.success('Password reset email sent. Check your inbox.')
    } catch (err) {
      let msg = 'Failed to send reset email.'
      if (err && err.code) {
        if (err.code === 'auth/user-not-found') msg = 'No user found with this email.'
        else if (err.code === 'auth/invalid-email') msg = 'Invalid email address.'
      }
      if (err && err.message) msg = err.message
      setError(msg)
      toast.error(msg)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-6 py-10">
      <div className="relative bg-white/4 border border-white/6 rounded-2xl p-8 backdrop-blur-md shadow-2xl shadow-black/40">

        <div className="absolute -inset-px rounded-2xl pointer-events-none" aria-hidden>
          <div className="h-full w-full rounded-2xl" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            mask: 'linear-gradient(180deg, rgba(0,0,0,1), rgba(0,0,0,0.6))'
          }} />
        </div>

        <div className="overflow-hidden">
          <div className={`flex w-[200%] transition-transform duration-500 ${forgotOpen ? '-translate-x-1/2' : 'translate-x-0'}`}>
            {/* Left: Login panel */}
            <div className="w-1/2 p-8">
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">IOTrix Manager</h1>
                <p className="text-sm text-slate-300 mt-1">Sign in to manage your IoT fleet</p>
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-900/70 border border-red-700 px-4 py-3 text-sm text-red-100">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="sr-only" htmlFor="email">Email</label>
                  <div className="flex items-center gap-3 bg-white/3 px-3 py-2 rounded-lg border border-white/6 focus-within:ring-2 focus-within:ring-sky-500 transition">
                    <Mail className="w-5 h-5 text-slate-300" />
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="bg-transparent outline-none text-slate-100 placeholder:text-slate-400 w-full" />
                  </div>
                </div>

                <div>
                  <label className="sr-only" htmlFor="password">Password</label>
                  <div className="relative flex items-center gap-3 bg-white/3 px-3 py-2 rounded-lg border border-white/6 focus-within:ring-2 focus-within:ring-sky-500 transition">
                    <Lock className="w-5 h-5 text-slate-300" />
                    <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your strong password" className="bg-transparent outline-none text-slate-100 placeholder:text-slate-400 w-full pr-10" />
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-300 hover:bg-white/6" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-300">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="accent-sky-400" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    <span>Remember me</span>
                  </label>
                  <button type="button" onClick={() => { setForgotOpen(true); setResetMessage(''); setResetEmail(email) }} className="text-sky-300 hover:underline">Forgot?</button>
                </div>

                <div>
                  <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold shadow-md hover:brightness-105 disabled:opacity-60">
                    {loading ? <Spinner /> : <ArrowRight className="w-4 h-4" />}
                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-xs text-slate-400">
                <span>Don’t have an account? </span>
                <a className="text-sky-300 hover:underline" href="#">Request access</a>
              </div>
            </div>

            {/* Right: Reset panel */}
            <div className="w-1/2 p-8 relative">
              <button type="button" onClick={() => setForgotOpen(false)} className="absolute left-4 top-4 inline-flex items-center gap-2 px-2 py-1 rounded-md text-slate-200 hover:bg-white/6">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>

              <div className="mt-8">
                <h2 className="text-lg font-semibold">Reset your password</h2>
                <p className="text-sm text-slate-300 mt-2">Enter the email associated with your account and we'll send a reset link.</p>

                <form className="mt-4" onSubmit={handleSendReset}>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@company.com" className="flex-1 bg-transparent outline-none text-slate-100 placeholder:text-slate-400 px-3 py-2 rounded-md border border-white/6" />

                  <button type="submit" disabled={resetLoading} className="inline-flex items-center gap-2 bg-sky-500 px-3 py-2 rounded-md text-sm font-medium mt-3">{resetLoading ? <Spinner /> : 'Send'}</button>
                </form>

                {resetMessage && <p className="mt-4 text-sm text-emerald-300">{resetMessage}</p>}
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        <span>© IOTrix • Dark Mode Futuristic</span>
      </div>
    </div>
  )
}
