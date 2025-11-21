"use client";

import React, { useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import {firebaseConfig} from '../../firebaseConfig';

if (!getApps().length) initializeApp(firebaseConfig);
const db = getDatabase();

export default function DevToolsPage() {
  const [loading, setLoading] = useState(false);

  async function wipeAndSeed() {
    if (!confirm('Are you sure? This will wipe Auth and RTDB and seed test accounts.')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('WIPE & SEED completed.\n' + JSON.stringify(data));
      } else {
        alert('WIPE & SEED failed:\n' + JSON.stringify(data));
      }
    } catch (err) {
      alert('Request failed: ' + String(err));
    } finally {
      setLoading(false);
    }
  }

  async function openDoorBeep() {
    try {
      await set(ref(db, 'hardware/door_lock'), 'OPEN');
      await set(ref(db, 'hardware/buzzer'), 'BEEP');
      alert('Door set to OPEN and buzzer BEEP');
    } catch (err) {
      alert('Failed to write hardware state: ' + String(err));
    }
  }

  async function lockDoorSilent() {
    try {
      await set(ref(db, 'hardware/door_lock'), 'LOCKED');
      await set(ref(db, 'hardware/buzzer'), 'OFF');
      alert('Door LOCKED and buzzer OFF');
    } catch (err) {
      alert('Failed to write hardware state: ' + String(err));
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Developer Tools</h2>
      <div style={{ display: 'flex', gap: 8, flexDirection: 'column', maxWidth: 420 }}>
        <button onClick={wipeAndSeed} disabled={loading}>
          {loading ? 'Working...' : 'WIPE & SEED ALL'}
        </button>
        <button onClick={openDoorBeep}>OPEN DOOR / BEEP</button>
        <button onClick={lockDoorSilent}>LOCK DOOR / SILENT</button>
      </div>
    </div>
  );
}
