"use client";

import { useState } from "react";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-900 via-amber-700 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg text-white text-2xl font-extrabold">
            W/M
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">Week in Music</h1>
            <p className="text-sm text-neutral-600">Your weekly guide to live music — venues, artists, and the calendar</p>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white border rounded-2xl shadow p-4">
            <h3 className="text-lg font-semibold mb-3">Add Event</h3>
            <div className="space-y-3">
              <input className="w-full border rounded-xl px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className="w-full border rounded-xl px-3 py-2" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
              <input className="w-full border rounded-xl px-3 py-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <input className="w-full border rounded-xl px-3 py-2" placeholder="Time (HH:MM)" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              <input className="w-full border rounded-xl px-3 py-2" placeholder="Artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={addEvent} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black text-white hover:opacity-90">Add</button>
                <button onClick={() => alert('Import CSV (not implemented)')} className="px-3 py-2 rounded-xl border">Import</button>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Search</h3>
            <input className="w-full border rounded-xl px-3 py-2" placeholder="Search events, artist or venue" value={query} onChange={(e) => setQuery(e.target.value)} />
            <p className="text-sm mt-2 text-neutral-500">Tip: try venue or artist names to filter.</p>
          </div>

          <div className="bg-white border rounded-2xl shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => alert('Export CSV (not implemented)')} className="px-3 py-2 rounded-xl border text-left">Export CSV</button>
              <button onClick={() => alert('Billing flow (not implemented)')} className="px-3 py-2 rounded-xl border text-left">Manage Venue Billing</button>
            </div>
          </div>
        </aside>

        {/* Right column */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Upcoming This Week</h2>
            <div className="text-sm text-neutral-600">{events.length} events</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((ev) => (
              <article key={ev.id} className="bg-white border rounded-2xl shadow p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{ev.title}</h3>
                    <p className="text-sm text-neutral-600">{ev.artist} • {ev.venue}</p>
                    <p className="text-sm mt-2">{ev.date} • {ev.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ev.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {ev.paid ? 'Paid' : 'Unpaid'}
                    </span>
                    <div className="flex gap-2">
                      <button title="Toggle Paid" onClick={() => togglePaid(ev.id)} className="p-2 rounded-lg border">Edit</button>
                      <button title="Delete" onClick={() => removeEvent(ev.id)} className="p-2 rounded-lg border">Delete</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-8 text-sm text-neutral-500">Built with ♥ for local music. Export, share, or post your weekly lineups.</footer>
    </div>
  );
}
