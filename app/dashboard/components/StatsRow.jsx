"use client"
import React from "react"

export default function StatsRow({ stats = { total_served_today: 0, fraud_attempts: 0, uptime: "—" } }) {
  const { total_served_today = 0, fraud_attempts = 0, uptime = "—" } = stats

  return (
    <div className="mt-8 rounded-xl p-4 bg-white/6 backdrop-blur-md border border-white/5 flex flex-col md:flex-row gap-4">
      <Stat label="Total Served Today" value={String(total_served_today)} accent="cyan" />
      <Stat label="Fraud Attempts" value={String(fraud_attempts)} accent="rose" />
      <Stat label="System Uptime" value={uptime} accent="emerald" />
    </div>
  )
}

function Stat({ label, value, accent = "cyan" }) {
  const accentClass = {
    cyan: "text-cyan-400",
    rose: "text-rose-400",
    emerald: "text-emerald-400",
  }[accent]

  return (
    <div className="flex-1 flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-400">{label}</div>
        <div className={`text-2xl font-semibold ${accentClass}`}>{value}</div>
      </div>
      <div className="hidden md:block w-12 h-12 rounded-full bg-white/3 flex items-center justify-center text-slate-900 font-bold">{value.split(" ")[0]}</div>
    </div>
  )
}
