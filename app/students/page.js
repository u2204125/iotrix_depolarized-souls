"use client";

import React, { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { getDatabase, ref, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../dashboard/components/Sidebar";
import Header from "../dashboard/components/Header";
import PageHead from "../dashboard/components/PageHead";
import "../enrollment/enrollment.css";

export default function StudentsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewPlans, setViewPlans] = useState(null);

  const db = typeof window !== "undefined" ? getDatabase() : null;

  const loadUsers = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const snap = await get(ref(db, "users"));
      const data = snap.exists() ? snap.val() : {};
      const rows = Object.keys(data).map((id) => ({ id, ...data[id] }));
      rows.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setUsers(rows);
    } catch (err) {
      console.error("loadUsers", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const profileSnap = await get(ref(db, `users/${user.uid}`));
        const profileVal = profileSnap.exists() ? profileSnap.val() : null;
        if (!profileVal || profileVal.role !== "manager") {
          setProfile(null);
          setLoading(false);
          return;
        }
        setProfile(profileVal);
        await loadUsers();
      } catch (err) {
        console.error("students auth", err);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openView = async (user) => {
    if (!db) return;
    setViewUser(user);
    setViewPlans(null);
    setViewOpen(true);
    try {
      const plansSnap = await get(ref(db, `plans/${user.id}`));
      setViewPlans(plansSnap.exists() ? plansSnap.val() : {});
    } catch (err) {
      console.error("load plans", err);
      setViewPlans({});
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <PageHead />
      <div className="flex">
        <Sidebar onToggle={() => setSidebarOpen((s) => !s)} />

        <div className="flex-1 min-h-screen md:pl-72">
          <Header mockUser={profile || { name: "Manager" }} onMenu={() => setSidebarOpen(true)} />

          <main className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-4">Students</h1>

            <div className="overflow-x-auto bg-slate-800/20 rounded shadow">
              <table className="min-w-full divide-y table-auto">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-200">Student ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-200">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-200">Role</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-200">RFID Tag</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-200">Status</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-slate-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-300">Loading...</td>
                    </tr>
                  )}

                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-300">No students found</td>
                    </tr>
                  )}

                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-2 text-sm text-slate-200">{u.id}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">{u.name}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">{u.role}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">{u.rfid_tag || "-"}</td>
                      <td className="px-4 py-2 text-sm">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-600 text-white">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-600 text-white">{u.status || "Inactive"}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-200 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openView(u)} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* View modal */}
            {viewOpen && viewUser && (
              <div className="fixed inset-0 z-40 flex items-center justify-center enrollment-calendar-modal">
                <div className="enrollment-calendar-box w-full max-w-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Student — {viewUser.id}</h3>
                    <button onClick={() => setViewOpen(false)} className="text-slate-300">Close</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-slate-300">Name</div>
                      <div className="font-medium text-slate-100">{viewUser.name}</div>
                      <div className="text-sm text-slate-300 mt-2">Role</div>
                      <div className="font-medium text-slate-100">{viewUser.role}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-300">RFID Tag</div>
                      <div className="font-medium text-slate-100">{viewUser.rfid_tag || '-'}</div>
                      <div className="text-sm text-slate-300 mt-2">Status</div>
                      <div className="font-medium text-slate-100">{viewUser.status}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Plans</h4>
                    <pre className="text-xs p-2 bg-slate-900 rounded text-slate-200 overflow-auto max-h-48">{JSON.stringify(viewPlans, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
