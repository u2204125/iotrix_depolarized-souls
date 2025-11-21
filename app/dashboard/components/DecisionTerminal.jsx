"use client"
import React from "react"
import { CheckCircle } from "lucide-react"

export default function DecisionTerminal({ student, active = true, onApprove, onDeny }) {
  const ineligibleReasons = []
  if (!student) {
    // no student loaded
  } else {
    if (student.has_eaten_today) ineligibleReasons.push("ALREADY_SERVED")
    if ((student.balance || 0) < 50) ineligibleReasons.push("INSUFFICIENT_FUNDS")
    if (student.flagged) ineligibleReasons.push(student.flag_reason || "FLAGGED")
  }

  const isIneligible = ineligibleReasons.length > 0

  return (
    <aside className="space-y-6">
      <div className={`rounded-xl p-4 ${isIneligible ? "bg-rose-900/20" : "bg-white/6"} backdrop-blur-md border border-white/5`}>
        {active && student ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={student.photo} alt="student" className="w-20 h-20 rounded-lg object-cover ring-1 ring-white/6" />
              <div>
                <h2 className="text-2xl font-semibold">{student.name}</h2>
                <div className="mt-1 text-sm text-slate-400">Student ID: {student.student_id || student.uid}</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${((student.balance || 0) >= 0) ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"}`}>
                  Balance: ৳{(student.balance || 0).toFixed(2)}
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-300">{student.status || "—"}</div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Verified biometrics
              </div>
            </div>

            {isIneligible && (
              <div className="rounded-md bg-rose-800/60 px-3 py-2 text-sm text-rose-100">
                <strong>Ineligible:</strong> {ineligibleReasons.join(" • ")}
              </div>
            )}

            <div className="pt-2 border-t border-white/4 flex flex-col gap-3">
              <button onClick={onApprove} disabled={isIneligible} className={`w-full py-3 rounded-lg text-lg font-semibold ${isIneligible ? "bg-emerald-600/40 text-slate-300" : "text-slate-900 bg-gradient-to-r from-emerald-400 to-emerald-600"} shadow-lg`}>APPROVE MEAL</button>
              <button onClick={onDeny} className="w-full py-3 rounded-lg text-lg font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 shadow-lg">DENY ACCESS</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-800 flex items-center justify-center text-slate-200 text-center font-semibold text-xl">Waiting for Student...</div>
          </div>
        )}
      </div>

      <div className="rounded-xl p-4 bg-white/6 backdrop-blur-md border border-white/5">
        <h3 className="text-sm text-slate-300 mb-3">Controls</h3>
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-md bg-white/5">Manual Scan</button>
          <button className="flex-1 py-2 rounded-md bg-white/5">Reset</button>
        </div>
      </div>
    </aside>
  )
}
