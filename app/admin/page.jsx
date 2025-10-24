"use client";

import { useMemo, useState } from "react";
import dataInitial from "../../data/week.json";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function emptyEvent() {
  return { venue: "", venueUrl: "", artist: "", date: "", time: "" };
}

function formatTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m ?? 0).padStart(2, "0")} ${ampm}`;
}

export default function AdminPage() {
  // Normalize incoming data to full-day keys with arrays
  const normalized = useMemo(() => {
    const days = Object.fromEntries(DAYS.map((d) => [d, []]));
    const src = dataInitial?.days || {};
    for (const d of DAYS) {
      const list = src[d];
      days[d] = Array.isArray(list) ? list : [];
    }
    return { days };
  }, []);

  const [data, setData] = useState(normalized);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [newEv, setNewEv] = useState(emptyEvent());
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    const base = data.days[selectedDay] || [];
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((e) =>
      [e.venue, e.artist, e.date, e.time]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [data, selectedDay, search]);

  function addEvent() {
    const { venue, date, time } = newEv;
    if (!venue || !date || !time) {
      alert("Please fill at least Venue, Date, and Time.");
      return;
    }
    setData((prev) => ({
      days: {
        ...prev.days,
        [selectedDay]: [{ ...newEv }, ...(prev.days[selectedDay] || [])],
      },
    }));
    setNewEv(emptyEvent());
  }

  function removeEvent(idx) {
    setData((prev) => {
      const copy = { ...prev.days };
      copy[selectedDay] = (copy[selectedDay] || []).filter((_, i) => i !== idx);
      return { days: copy };
    });
  }

  function updateEvent(idx, field, value) {
    setData((prev) => {
      const copy = { ...prev.days };
      const arr = [...(copy[selectedDay] || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      copy[selectedDay] = arr;
      return { days: copy };
    });
  }

  function downloadWeekJson() {
    const file = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = "week.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const totalCount = useMemo(
    () => DAYS.reduce((sum, d) => sum + (data.days[d]?.length || 0), 0),
    [data]
  );

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin — Week in Music</h1>
          <p className="text-sm text-neutral-600">
            Edit the weekly lineup privately. When done, click{" "}
            <strong>Download week.json</strong> and commit it to{" "}
            <code>data/week.json</code> in GitHub.
          </p>
        </div>
        <button
          onClick={downloadWeekJson}
          className="px-3 py-2 rounded-xl bg-black text-white hover:opacity-90"
        >
          Download week.json
        </button>
      </header>

      {/* Controls */}
      <section className="bg-white border rounded-2xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm font-medium">
            Day
            <select
              className="mt-1 w-full border rounded-xl px-3 py-2 bg-white"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d} ({data.days[d]?.length || 0})
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2 text-sm font-medium">
            Search {selectedDay}
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              placeholder="Search by venue / artist / date / time"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </section>

      {/* Add Event */}
      <section className="bg-white border rounded-2xl shadow p-4">
        <h3 className="text-lg font-semibold mb-3">
          Add Event to {selectedDay}
        </h3>
        <div className="grid md:grid-cols-5 gap-2">
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Venue (required)"
            value={newEv.venue}
            onChange={(e) => setNewEv({ ...newEv, venue: e.target.value })}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Venue URL (https://...)"
            value={newEv.venueUrl}
            onChange={(e) => setNewEv({ ...newEv, venueUrl: e.target.value })}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Artist"
            value={newEv.artist}
            onChange={(e) => setNewEv({ ...newEv, artist: e.target.value })}
          />
          <input
            className="border rounded-xl px-3 py-2"
            type="date"
            value={newEv.date}
            onChange={(e) => setNewEv({ ...newEv, date: e.target.value })}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Time (HH:MM)"
            value={newEv.time}
            onChange={(e) => setNewEv({ ...newEv, time: e.target.value })}
          />
        </div>
        <div className="mt-3">
          <button
            onClick={addEvent}
            className="px-3 py-2 rounded-xl bg-wm-ink text-white hover:opacity-90"
          >
            Add
          </button>
        </div>
      </section>

      {/* List & Inline Edit */}
      <section className="bg-white border rounded-2xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {selectedDay} — {list.length} show{list.length === 1 ? "" : "s"}
          </h3>
          <div className="text-sm text-neutral-600">
            Total this week: {totalCount}
          </div>
        </div>

        {list.length === 0 ? (
          <p className="text-sm text-neutral-600">
            No shows for {selectedDay}.
          </p>
        ) : (
          <div className="space-y-3">
            {list.map((ev, idx) => (
              <div key={idx} className="border rounded-xl p-3">
                <div className="grid md:grid-cols-5 gap-2">
                  <input
                    className="border rounded-xl px-3 py-2"
                    value={ev.venue || ""}
                    onChange={(e) => updateEvent(idx, "venue", e.target.value)}
                    placeholder="Venue"
                  />
                  <input
                    className="border rounded-xl px-3 py-2"
                    value={ev.venueUrl || ""}
                    onChange={(e) =>
                      updateEvent(idx, "venueUrl", e.target.value)
                    }
                    placeholder="Venue URL (https://...)"
                  />
                  <input
                    className="border rounded-xl px-3 py-2"
                    value={ev.artist || ""}
                    onChange={(e) =>
                      updateEvent(idx, "artist", e.target.value)
                    }
                    placeholder="Artist"
                  />
                  <input
                    className="border rounded-xl px-3 py-2"
                    type="date"
                    value={ev.date || ""}
                    onChange={(e) => updateEvent(idx, "date", e.target.value)}
                    placeholder="Date"
                  />
                  <input
                    className="border rounded-xl px-3 py-2"
                    value={ev.time || ""}
                    onChange={(e) => updateEvent(idx, "time", e.target.value)}
                    placeholder="Time (HH:MM)"
                  />
                </div>

                <div className="mt-2 text-sm text-neutral-600">
                  Preview: {ev.venue || "Venue"} — {ev.artist || "Artist TBA"} —{" "}
                  {formatTime(ev.time || "")} {ev.date ? `• ${ev.date}` : ""}
                </div>

                <div className="mt-2">
                  <button
                    className="px-2 py-1 rounded border"
                    onClick={() => removeEvent(idx)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* JSON Preview */}
      <section className="bg-white border rounded-2xl shadow p-4">
        <h3 className="text-lg font-semibold mb-2">JSON Preview</h3>
        <pre className="overflow-auto text-sm bg-neutral-50 p-3 rounded-xl border">
{JSON.stringify(data, null, 2)}
        </pre>
        <p className="text-sm text-neutral-600 mt-2">
          Click “Download week.json”, then upload/commit it to{" "}
          <code>data/week.json</code> in GitHub to publish.
        </p>
      </section>
    </main>
  );
}
