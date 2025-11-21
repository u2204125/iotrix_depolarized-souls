"use client";
import React, { useState, useEffect } from 'react';

export default function PurchaseToken({ user, onLoginRequired }) {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // if user unknown, try reading from localStorage
    if (!user) {
      try {
        const stored = JSON.parse(localStorage.getItem('student_user'));
        if (stored) {
          // nothing else to do here; parent should handle state
        }
      } catch (e) {}
    }
  }, [user]);

  async function handlePurchase(e) {
    e && e.preventDefault();
    setMessage(null);
    if (!user) {
      onLoginRequired && onLoginRequired();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/students/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, days })
      });
      const data = await res.json();
      if (res.status === 409) {
        setPending(true);
        setMessage('You already have a pending purchase. Please wait for it to be processed.');
      } else if (!res.ok) {
        throw new Error(data.error || 'Purchase failed');
      } else {
        setPending(true);
        setMessage('Purchase submitted and is pending.');
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      {!user && <div>Please log in to purchase tokens.</div>}
      {user && (
        <div>
          <div style={{ marginBottom: 8 }}>Account: <strong>{user.name}</strong> ({user.email})</div>
          <form onSubmit={handlePurchase}>
            <div style={{ marginBottom: 8 }}>
              <label>Days</label><br />
              <input type="number" min={1} value={days} onChange={e => setDays(Number(e.target.value))} />
            </div>
            <div>
              <button type="submit" disabled={loading || pending}>{loading ? 'Submitting...' : pending ? 'Pending' : 'Purchase'}</button>
            </div>
          </form>
          {message && <div style={{ marginTop: 8 }}>{message}</div>}
        </div>
      )}
    </div>
  );
}
