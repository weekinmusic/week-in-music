"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

// Weekday labels Monday → Sunday
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helpers
function toWeekIndex(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const js = d.getDay(); // 0=Sun..6=Sat
  return js === 0 ? 6 : js - 1; // Mon=0..Sun=6
}
function formatTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m ?? 0).padStart(2, "0")} ${ampm}`;
}

export default function WeekInMusicApp() {
  // Sample data (replace with yours)
  const [events, setEvents] = useState([
    { id: 1, title: "Acoustic Night", venue: "Bluebird Bar", artist: "The Rivets", date: "2025-10-27", time: "19:00", paid: false }, // Mon
    { id: 2, title: "Open Mic", venue: "The Garage", artist: "House Band", date: "2025-10-29", time: "20:00", paid: true },         // Wed
    { id: 3, title: "Friday Jazz", venue: "Ivory Lounge", artist: "Kip Richard Trio", date: "2025-10-31", time: "21:30", paid: true }, // Fri
  ]);
  const [form, setForm] = useState({ title: "", venue: "", artist: "", date: "", time: "" });
  const [query, setQuery] = useState("");
  const [dayFilter, setDayFilter] = useState(null); // null = all days, else 0..6

  // Actions
  const addEvent = () => {
    if (!form.title || !form.venue || !form.date) return;
    const next = { ...form, id: Date.now(), paid: false };
    setEvents((s) => [next, ...s]);
    setForm({ title: "", venue: "", artist: "", date: "", time: "" });
  };
  const togglePaid = (id) => setEvents((s) => s.map(e => e.id === id ? { ...e, paid: !e.paid } : e));
  const removeEvent = (id) => setEvents((s) => s.filter(e => e.id !== id));

  // Search + filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = events;
    if (q) {
      list = list.filter(e => [e.title, e.venue, e.artist].some(v => (v || "").toLowerCase().includes(q)));
    }
    if (dayFilter !== null) {
      list = list.filter(e => toWeekIndex(e.date) === dayFilter);
    }
    return list;
  }, [events, query, dayFilter]);

  // Group by weekday Mon..Sun
  const grouped = useMemo(() => {
    const buckets = Array.from({ length: 7 }, () => []);
    for (const ev of filtered) {
      const idx = toWeekIndex(ev.date);
      if (idx >= 0 && idx <= 6) buckets[idx].push(ev);
    }
    for (const day of buckets) {
      day.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    }
    return buckets;
  }, [filtered]);

  return (
    <div className="space-y-8">
      {/* Hero / Header */}
      <div className="rounded-2xl bg-gradient-to-br from-wm-leather via-wm-accent to-wm-amber text-white p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
            {/* Logo if present at /public/logo.png */}
            <Image
              src="/logo.png"
              alt="Week in Music"
              width={64}
              height={64}
              className="w-12 h-12 object-contain rounded-xl"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold leading-tight">Week in Music</h1>
            <p className="text-white/85 text-sm">Your weekly guide to live music — venues, artists, and times</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <aside className="space-y-4">
          {/* Add Event */}
          <section className="bg-white border rounded-2xl shadow-soft p-4">
            <h3 className="text-lg font-semibold mb-3">Add Event</h3>
            <div className="space-y-3">
              <input className="w-full border rounded-xl px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className="w-full border rounded-xl px-3 py-2" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
              <input className="w-full border rounded-xl px-3 py-2" placeholder="Artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border rounded-xl px-3 py-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <input className="border rounded-xl px-3 py-2" placeholder="Time (HH:MM)" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button onClick={addEvent} className="px-3 py-2 rounded-xl bg-wm-ink text-white hover:opacity-90">Add</button>
                <button onClick={() => alert('Import CSV (not implemented)')} className="px-3 py-2 rounded-xl border bg-white">Import</button>
              </div>
            </div>
          </section>

          {/* Search */}
          <section className="bg-white border rounded-2xl shadow-soft p-4">
            <h3 className="text-lg font-semibold mb-2">Search</h3>
            <input className="w-full border rounded-xl px-3 py-2" placeholder="Search venue, artist, or title" value={query} onChange={(e) => setQuery(e.target.value)} />
            <p className="text-sm mt-2 text-neutral-600">Tip: Try a venue name (e.g., “Bluebird”) or artist.</p>
          </section>

          {/* Day filter */}
          <section className="bg-white border rounded-2xl shadow-soft p-4">
            <h3 className="text-lg font-semibold mb-2">Filter by Day</h3>
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAY_LABELS.map((lbl, idx) => (
                <button
                  key={lbl}
                  onClick={() => setDayFilter(dayFilter === idx ? null : idx)}
                  className={`px-2 py-1 rounded-lg border text-sm ${dayFilter === idx ? "bg-wm-amber text-white border-wm-amber" : "bg-white hover:bg-neutral-50"}`}
                  title={lbl}
                >
                  {lbl}
                </button>
              ))}
            </div>
            {dayFilter !== null && (
              <button className="mt-3 text-sm underline" onClick={() => setDayFilter(null)}>Clear filter</button>
            )}
          </section>

          {/* Tips */}
          <section className="bg-white border rounded-2xl shadow-soft p-4">
            <h3 className="text-lg font-semibold mb-2">Brand Settings</h3>
            <ul className="text-sm text-neutral-600 list-disc pl-5 space-y-1">
              <li>Replace <code>/public/logo.png</code> with your logo (same name).</li>
              <li>Adjust colors in <code>tailwind.config.js</code> under <code>colors.wm</code>.</li>
              <li>Background set to <code>bg-wm-sand</code> in <code>app/layout.jsx</code>.</li>
            </ul>
          </section>
        </aside>

        {/* Right column: Week grid */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">This Week</h2>
            <div className="text-sm text-neutral-600">{filtered.length} event{filtered.length === 1 ? "" : "s"}</div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {WEEKDAY_LABELS.map((label, idx) => (
              <div key={label} className="bg-white border rounded-2xl shadow-soft p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{label}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700">
                    {grouped[idx].length} show{grouped[idx].length === 1 ? "" : "s"}
                  </span>
                </div>

                {grouped[idx].length === 0 ? (
                  <p className="text-sm text-neutral-500">No shows yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {grouped[idx].map((ev) => (
                      <li key={ev.id} className="border rounded-xl p-3 hover:shadow-soft transition">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{ev.title}</div>
                            <div className="text-sm text-neutral-600">{ev.artist || "Artist TBA"} • {ev.venue}</div>
                            <div className="text-sm mt-1">{ev.date} • {formatTime(ev.time)}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${ev.paid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {ev.paid ? "Paid" : "Unpaid"}
                            </span>
                            <div className="flex gap-2">
                              <button className="text-xs px-2 py-1 rounded border" onClick={() => togglePaid(ev.id)}>Toggle</button>
                              <button className="text-xs px-2 py-1 rounded border" onClick={() => removeEvent(ev.id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="text-sm text-neutral-500">Built with ♥ for local music. Export, share, or post your weekly lineups.</footer>
    </div>
  );
}
