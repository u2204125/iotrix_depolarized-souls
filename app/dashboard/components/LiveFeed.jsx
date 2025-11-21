"use client"
import React from "react"

export default function LiveFeed() {
  return (
    <section className="lg:col-span-2">
      <div className="aspect-video rounded-xl overflow-hidden relative bg-slate-800 border border-white/6 backdrop-blur-md bg-white/2">
        <img
          src="https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=9f1b7a7f6a5a063bd827b9c3f2f1d8f9"
          alt="camera-placeholder"
          className="w-full h-full object-cover brightness-75"
        />

        <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
          <div className="bg-white/10 backdrop-blur-md rounded-md px-3 py-1 text-sm font-medium text-slate-100 border border-white/6">Live Camera Feed</div>
          <div className="mt-4 w-full">
            <div className="bg-gradient-to-r from-cyan-400/10 via-white/5 to-cyan-400/10 p-2 rounded-md text-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-400">Mode</div>
                <div className="text-sm font-semibold">Scanning</div>
              </div>
              <div className="text-xs text-emerald-300">FPS 24</div>
            </div>
            <div className="mt-3 p-3 rounded-md bg-white/5 backdrop-blur-md border border-white/4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <div className="text-sm">Scanning...</div>
              </div>
              <div className="text-xs text-slate-400">No alerts</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
