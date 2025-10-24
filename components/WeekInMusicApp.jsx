"use client";

import { useState } from "react";

export default function WeekInMusicApp() {
  const [events] = useState([
    { id: 1, title: "Acoustic Night: The Rivets", venue: "Bluebird Bar", date: "2025-10-26", time: "19:00", artist: "The Rivets", paid: false },
    { id: 2, title: "Open Mic", venue: "The Garage", date: "2025-10-28", time: "20:00", artist: "Open Stage", paid: true }
  ]);

  return (
    <div style={{ padding: 16, border: "1px solid #e5e5e5", borderRadius: 12, background: "#fff" }}>
      <h2 style={{ margin: 0 }}>Upcoming This Week</h2>
      <ul>
        {events.map(e => (
          <li key={e.id}>{e.title} — {e.venue} — {e.date} {e.time}</li>
        ))}
      </ul>
    </div>
  );
}
