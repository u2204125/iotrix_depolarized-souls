"use client"
import React from "react"
import { Monitor, UserPlus, FileText, Settings, Menu, Users, LogOut } from "lucide-react"
import Link from "next/link"
export default function Sidebar({ onToggle, onLogout }) {
  return (
    <aside className="fixed z-30 inset-y-0 left-0 w-20 md:w-72 transform bg-[rgba(8,10,15,0.6)] backdrop-blur-md border-r border-white/5">
      <div className="h-full flex flex-col justify-between py-6 px-3 md:px-6">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-cyan-400 to-sky-600 flex items-center justify-center text-black font-bold">CC</div>
              <div className="hidden md:block">
                <h3 className="text-lg font-semibold">Command Center</h3>
                <p className="text-xs text-slate-400">Manager Dashboard</p>
              </div>
            </div>
            <button className="md:hidden p-2 rounded-md bg-white/5" onClick={onToggle} aria-label="toggle sidebar">
              <Menu className="w-5 h-5 text-slate-200" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem label="Enrollment" Icon={UserPlus} href="/enrollment" />
            <NavItem label="Students" Icon={Users} href="/students" />
          </nav>

          <div className="mt-6 hidden md:block">
            <div className="text-xs text-slate-400">v1.0 • Stable</div>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => onLogout && onLogout()}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-white/3 text-left text-rose-400 pointer-events-auto"
            aria-label="logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:block text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ label, Icon, href }) {
  return (
    <Link href={href} className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-white/3 text-left">
      <Icon className="w-5 h-5 text-cyan-400" />
      <span className="hidden md:block text-sm font-medium text-slate-200">{label}</span>
    </Link>
  )
}
