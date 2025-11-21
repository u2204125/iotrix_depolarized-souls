"use client"

import React, { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { firebaseConfig } from "../../firebaseConfig";

// Initialize Firebase client-side only once
let app;
if (typeof window !== "undefined") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
}

export default function Page() {
  const [session, setSession] = useState({ status: "--", detected_name: "--" });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!app) return;
    const db = getDatabase(app);
    const liveRef = ref(db, "/live_session");

    const unsubscribe = onValue(liveRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setSession({
          status: val.status ?? "",
          detected_name: val.detected_name ?? "",
        });
      } else {
        setSession({ status: "(no data)", detected_name: "(no data)" });
      }
    }, (err) => {
      console.error("Realtime DB listener error:", err);
      setError(err?.message || String(err));
    });

    return () => unsubscribe();
  }, []);

  const writeStatus = async (newStatus) => {
    try {
      if (!app) throw new Error("Firebase app not initialized. Replace placeholders in config.");
      const db = getDatabase(app);
      await set(ref(db, "/live_session/status"), newStatus);
    } catch (err) {
      console.error(err);
      setError(err?.message || String(err));
    }
  };

  return (
    <div>
      <h3>Live Session</h3>
      <div>Status: {session.status}</div>
      <div>Detected Name: {session.detected_name}</div>
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      <div style={{ marginTop: 12 }}>
        <button onClick={() => writeStatus("APPROVED")}>Test Approve</button>
        <button onClick={() => writeStatus("IDLE")} style={{ marginLeft: 8 }}>Reset</button>
      </div>
    </div>
  );
}
