"use client"
import React from 'react'
import Link from 'next/link'
import { User, CreditCard, Home, Menu } from 'lucide-react'

export default function StudentSidebar({ onToggle }) {
  return (
    <aside className="fixed z-30 inset-y-0 left-0 w-20 md:w-72 transform bg-[rgba(8,10,15,0.6)] backdrop-blur-md border-r border-white/5">
      <div className="h-full flex flex-col py-6 px-3 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-rose-400 to-pink-600 flex items-center justify-center text-black font-bold">SP</div>
            <div className="hidden md:block">
              <h3 className="text-lg font-semibold">Student Portal</h3>
              <p className="text-xs text-slate-400">Student Access</p>
            </div>
          </div>
          <button className="md:hidden p-2 rounded-md bg-white/5" onClick={onToggle} aria-label="toggle sidebar">
            <Menu className="w-5 h-5 text-slate-200" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem label="Home" Icon={Home} href="/student-portal" />
          <NavItem label="Purchase" Icon={CreditCard} href="/student-portal/purchase" />
          <NavItem label="Dashboard" Icon={User} href="/student-portal/dashboard" />
        </nav>

        <div className="mt-6 hidden md:block">
          <div className="text-xs text-slate-400">v1.0 • Demo</div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ label, Icon, href }) {
  return (
    <Link href={href} className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-white/3 text-left">
      <Icon className="w-5 h-5 text-rose-400" />
      <span className="hidden md:block text-sm font-medium text-slate-200">{label}</span>
    </Link>
  )
}
