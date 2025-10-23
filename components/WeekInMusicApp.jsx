"use client";

import { useState } from "react";
import { Mail, Globe, Instagram, Facebook, Tiktok, Plus, Trash2, Pencil } from "lucide-react";

export default function WeekInMusicApp() {
  const [events, setEvents] = useState([
    { id: 1, title: "Acoustic Night: The Rivets", venue: "Bluebird Bar", date: "2025-10-26", time: "19:00", artist: "The Rivets", paid: false },
    { id: 2, title: "Open Mic", venue: "The Garage", date: "2025-10-28", time: "20:00", artist: "Open Stage", paid: true }
  ]);
  const [form, setForm] = useState({ title: "", venue: "", date: "", time: "", artist: "" });
  const [query, setQuery] = useState("");

  const addEvent = () => {
    if (!form.title || !form.date) return;
    const next = { ...form, id: Date.now(), paid: false };
    setEvents((s) => [next, ...s]);
    setForm({ title: "", venue: "", date: "", time: "", artist: "" });
  };
  const togglePaid = (id) => setEvents((s) => s.map((e) => (e.id === id ? { ...e, paid: !e.paid } : e)));
  const removeEvent = (id) => setEvents((s) => s.filter((e) => e.id !== id));

  const filtered = events.filter((e) => {
    const q = query.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.artist.toLowerCase().includes(q);
  });

  const card = {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    padding: 16
  };

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 80, height: 80, background: "linear-gradient(135deg,#78350f,#b45309,#f59e0b)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 24, boxShadow: "0 6px 18px rgba(0,0,0,0.15)" }}>
            W/M
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Week in Music</h1>
            <p style={{ margin: "6px 0 0", color: "#555" }}>Your weekly guide to live music — venues, artists, and the calendar</p>
          </div>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 8, color: "#444" }}>
          <a title="Email"><Mail /></a>
          <a title="TikTok"><Tiktok /></a>
          <a title="Facebook"><Facebook /></a>
          <a title="Website"><Globe /></a>
          <a title="Instagram"><Instagram /></a>
        </nav>
      </header>

      {/* Controls & Events */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        {/* Left column */}
        <aside>
          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 600 }}>Add Event</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" }} />
              <input placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" }} />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" }} />
              <input placeholder="Time (HH:MM)" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" }} />
              <input placeholder="Artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addEvent} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 12px", borderRadius: 12, background: "#111", color: "#fff", border: "none" }}>
                  <Plus size={16} /> Add
                </button>
                <button onClick={() => alert("Import CSV (not implemented)")} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "#fff" }}>
                  Import
                </button>
              </div>
            </div>
          </div>

          <div style={{ ...card, marginTop: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>Search</h3>
            <input placeholder="Search events, artist or venue" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" }} />
            <p style={{ marginTop: 8, color: "#666", fontSize: 14 }}>Tip: try venue or artist names to filter.</p>
          </div>

          <div style={{ ...card, marginTop: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>Quick Actions</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <button onClick={() => alert("Export CSV (not implemented)")} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "#fff" }}>
                Export CSV
              </button>
              <button onClick={() => alert("Billing flow (not implemented)")} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "#fff" }}>
                Manage Venue Billing
              </button>
            </div>
          </div>
        </aside>

        {/* Right column */}
        <section>
          <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Upcoming This Week</h2>
            <div style={{ color: "#666", fontSize: 14 }}>{events.length} events</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map((ev) => (
              <article key={ev.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{ev.title}</h3>
                    <p style={{ margin: "6px 0 0", color: "#666", fontSize: 14 }}>
                      {ev.artist} • {ev.venue}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 14 }}>{ev.date} • {ev.time}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <span style={{ padding: "4px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: ev.paid ? "#dcfce7" : "#fef9c3", color: ev.paid ? "#166534" : "#854d0e" }}>
                      {ev.paid ? "Paid" : "Unpaid"}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button title="Toggle Paid" onClick={() => togglePaid(ev.id)} style={{ padding: 8, borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}>
                        <Pencil size={14} />
                      </button>
                      <button title="Delete" onClick={() => removeEvent(ev.id)} style={{ padding: 8, borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer style={{ marginTop: 24, fontSize: 14, color: "#666" }}>
        Built with ♥ for local music. Export, share, or post your weekly lineups.
      </footer>
    </div>
  );
}
