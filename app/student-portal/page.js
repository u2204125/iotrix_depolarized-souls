"use client";
import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import PurchaseToken from './components/PurchaseToken';
import StudentSidebar from './components/Sidebar';
import StudentHeader from './components/Header';
import StudentPageHead from './components/PageHead';

export default function StudentPortalPage() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('student_user')); } catch { return null; }
    }
    return null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogin(userObj) {
    setUser(userObj);
    localStorage.setItem('student_user', JSON.stringify(userObj));
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('student_user');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <StudentPageHead />
      <div className="flex">
        <StudentSidebar onToggle={() => setSidebarOpen((s) => !s)} />

        <div className="flex-1 min-h-screen md:pl-72">
          <StudentHeader mockUser={user || { name: 'Guest' }} onMenu={() => setSidebarOpen(true)} />

          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-semibold">Student Portal</h1>
                <div className="text-sm text-slate-400">Login Signup Purchase Token</div>
              </div>

              <div className="space-x-2 mb-4">
                <button className="px-3 py-1 rounded bg-white/5" onClick={() => setView('login')} disabled={view === 'login'}>Login</button>
                <button className="px-3 py-1 rounded bg-white/5" onClick={() => setView('signup')} disabled={view === 'signup'}>Signup</button>
                <button className="px-3 py-1 rounded bg-white/5" onClick={() => setView('purchase')} disabled={view === 'purchase'}>Purchase Token</button>
                {user && <button className="px-3 py-1 rounded bg-white/5" onClick={handleLogout}>Logout</button>}
              </div>

              <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-md border border-white/5">
                {!user && view === 'login' && <LoginForm onSuccess={handleLogin} />}
                {!user && view === 'signup' && <SignupForm onSuccess={handleLogin} />}
                {view === 'purchase' && <PurchaseToken user={user} onLoginRequired={() => setView('login')} />}
                {user && view !== 'purchase' && (
                  <div className="mt-4 text-slate-300">
                    <strong>Signed in as:</strong> {user.name} ({user.email})
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
