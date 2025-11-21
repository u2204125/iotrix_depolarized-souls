"use client";

import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./enrollment.css";
import { auth } from "../../firebaseConfig";
import { getDatabase, ref, get, remove, set, update, runTransaction } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../dashboard/components/Sidebar";
import Header from "../dashboard/components/Header";
import PageHead from "../dashboard/components/PageHead";

const EnrollmentPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [consumedDates, setConsumedDates] = useState(new Set());
  const [calendarTitle, setCalendarTitle] = useState("");
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // use Realtime DB instance (dashboard style)
  const db = typeof window !== "undefined" ? getDatabase() : null;

  const loadData = async () => {
    if (!db) return;
    setLoading(true);

    const usersSnap = await get(ref(db, "users"));
    const plansSnap = await get(ref(db, "plans"));

    const users = usersSnap.exists() ? usersSnap.val() : {};
    const plans = plansSnap.exists() ? plansSnap.val() : {};

    const newRows = [];
    for (const studentId of Object.keys(plans || {})) {
      const studentPlans = plans[studentId] || {};
      for (const monthKey of Object.keys(studentPlans)) {
        const p = studentPlans[monthKey];
        newRows.push({
          studentId,
          monthKey,
          days: p.purchased_days ?? p.days ?? 0,
          amountPaid: p.amount_paid ?? p.amountPaid ?? 0,
          due: p.due ?? 0,
          note: p.note ?? "",
          purchaseDate: p.purchase_date ?? null,
          status: p.status ?? null,
          raw: p,
          studentName: users[studentId]?.name ?? studentId,
        });
      }
    }

    newRows.sort((a, b) => {
      if (a.purchaseDate && b.purchaseDate) return new Date(b.purchaseDate) - new Date(a.purchaseDate);
      return b.monthKey.localeCompare(a.monthKey);
    });

    setRows(newRows);
    setLoading(false);
  };

  useEffect(() => {
    // Auth + role check (only manager allowed)
    if (!auth) {
      // no firebase client
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const profileSnap = await get(ref(db, `users/${user.uid}`));
        const profileVal = profileSnap.exists() ? profileSnap.val() : null;
        if (!profileVal || profileVal.role !== 'manager') {
          // not authorized — keep profile null and don't load data
          setProfile(null);
          setRows([]);
          setLoading(false);
          return;
        }
        setProfile(profileVal);
        await loadData();
      } catch (err) {
        console.error('enrollment auth error', err);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCalendarFor = async (studentId, monthKey) => {
    if (!db) return;
    setCalendarTitle(`${studentId} — ${monthKey}`);
    const logsSnap = await get(ref(db, `logs/${monthKey}`));
    const consumed = new Set();
    if (logsSnap.exists()) {
      const monthLogs = logsSnap.val();
      Object.keys(monthLogs).forEach((day) => {
        const dayObj = monthLogs[day] || {};
        if (dayObj[studentId]) {
          const [year, month] = monthKey.split("_");
          const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          consumed.add(dateStr);
        }
      });
    }
    setConsumedDates(consumed);
    setCalendarOpen(true);
  };

  // manager actions: accept / reject purchase
  const acceptPurchase = async (studentId, monthKey) => {
    if (!db) return;
    const ok = window.confirm(`Accept purchase ${monthKey} for ${studentId}?`);
    if (!ok) return;
    const payload = {
      ...(rows.find(r => r.studentId === studentId && r.monthKey === monthKey)?.raw || {}),
      status: 'approved',
      approved_by: profile?.uid || 'manager',
      approved_at: new Date().toISOString(),
    };
    await update(ref(db, `plans/${studentId}/${monthKey}`), payload);
    await loadData();
  };

  const rejectPurchase = async (studentId, monthKey) => {
    if (!db) return;
    const ok = window.confirm(`Reject purchase ${monthKey} for ${studentId}?`);
    if (!ok) return;
    const payload = {
      ...(rows.find(r => r.studentId === studentId && r.monthKey === monthKey)?.raw || {}),
      status: 'rejected',
      rejected_by: profile?.uid || 'manager',
      rejected_at: new Date().toISOString(),
    };
    await update(ref(db, `plans/${studentId}/${monthKey}`), payload);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <PageHead />
      <div className="flex">
        <Sidebar onToggle={() => setSidebarOpen(s => !s)} />

        <div className="flex-1 min-h-screen md:pl-72">
          <Header mockUser={profile || { name: 'Manager' }} onMenu={() => setSidebarOpen(true)} />

          <main className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-4">Enrollment — Purchases</h1>

            <div className="overflow-x-auto bg-slate-800/20 rounded shadow">
        <table className="min-w-full divide-y table-auto">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-200">Student ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-200">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-200">Month</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-slate-200">Days</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-slate-200">Amount</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-slate-200">Due</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-200">Note</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-200">Purchase Date</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-slate-200">Status</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-sm text-slate-300">Loading...</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-sm text-slate-300">No purchase records</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={`${r.studentId}_${r.monthKey}`}>
                <td className="px-4 py-2 text-sm text-slate-200">{r.studentId}</td>
                <td className="px-4 py-2 text-sm text-slate-200">{r.studentName}</td>
                <td className="px-4 py-2 text-sm text-slate-200">{r.monthKey}</td>
                <td className="px-4 py-2 text-sm text-slate-200 text-right">{r.days}</td>
                <td className="px-4 py-2 text-sm text-slate-200 text-right">{r.amountPaid}</td>
                <td className="px-4 py-2 text-sm text-slate-200 text-right">{r.due}</td>
                <td className="px-4 py-2 text-sm text-slate-200">{r.note}</td>
                <td className="px-4 py-2 text-sm text-slate-200">{r.purchaseDate ? new Date(r.purchaseDate).toLocaleString() : "-"}</td>
                <td className="px-4 py-2 text-center text-sm">
                  {r.status === 'approved' && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-600 text-white">Approved</span>}
                  {r.status === 'rejected' && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-rose-600 text-white">Rejected</span>}
                  {!r.status && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-600 text-white">Pending</span>}
                </td>
                <td className="px-4 py-2 text-sm text-slate-200 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openCalendarFor(r.studentId, r.monthKey)} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">Calendar</button>
                    {!(r.status === 'approved' || r.status === 'rejected') && (
                      <>
                        <button onClick={() => acceptPurchase(r.studentId, r.monthKey)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Accept</button>
                        <button onClick={() => rejectPurchase(r.studentId, r.monthKey)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calendar Modal */}
      {calendarOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center enrollment-calendar-modal">
          <div className="enrollment-calendar-box w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Consumed Days — {calendarTitle}</h3>
              <button onClick={() => setCalendarOpen(false)} className="text-slate-300">Close</button>
            </div>
            <Calendar
              tileClassName={({ date }) => {
                const iso = date.toISOString().slice(0, 10);
                return consumedDates.has(iso) ? "react-calendar__tile--active" : null;
              }}
            />
          </div>
        </div>
      )}

      {/* edit modal removed — managers can only accept/reject purchases */}
          </main>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;