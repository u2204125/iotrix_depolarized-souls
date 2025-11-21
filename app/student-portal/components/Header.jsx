"use client"
import React from 'react'
import { User, Menu } from 'lucide-react'

export default function StudentHeader({ mockUser, onMenu }) {
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-b from-slate-900/50 to-transparent border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 rounded-md bg-white/5" onClick={onMenu}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-rose-400 shadow-md" />
              <div className="text-sm">Portal Status</div>
            </div>
            <div className="text-xs text-slate-400">Ready</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 bg-white/5 px-3 py-1 rounded-md backdrop-blur-md border border-white/6">
            <span className="text-xs text-slate-400">Student</span>
            <div className="flex items-center gap-2">
              <img src={mockUser?.photo} alt="profile" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" />
              <div className="text-sm font-medium">{mockUser?.name || 'Guest'}</div>
            </div>
          </div>

          <div className="relative">
            <button className="p-2 rounded-full bg-white/3 ring-1 ring-white/6">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
