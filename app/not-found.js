import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
      <div className="max-w-2xl p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/6 text-center">
        <h1 className="text-6xl font-extrabold text-cyan-300">404</h1>
        <p className="mt-4 text-xl text-slate-200">Command not found — the page you requested doesn't exist.</p>
        <p className="mt-2 text-sm text-slate-400">Return to the control panel or sign in again.</p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link href="/dashboard" className="px-4 py-2 rounded-md bg-cyan-500 text-slate-900 font-semibold hover:brightness-105">Dashboard</Link>
          <Link href="/login" className="px-4 py-2 rounded-md bg-white/6 text-slate-100">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
