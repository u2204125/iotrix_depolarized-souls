"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '../components/LoginForm'
import StudentSidebar from '../components/Sidebar'
import StudentHeader from '../components/Header'
import StudentPageHead from '../components/PageHead'

export default function LoginPage() {
  const router = useRouter()
  function handleSuccess() { router.push('/student-portal/dashboard') }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <StudentPageHead />
      <div className="flex">
        <StudentSidebar />
        <div className="flex-1 min-h-screen md:pl-72">
          <StudentHeader />
          <main className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-md border border-white/5">
              <h2 className="text-xl font-semibold mb-4">Login</h2>
              <LoginForm onSuccess={handleSuccess} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
