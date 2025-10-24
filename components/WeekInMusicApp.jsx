"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Format "HH:MM" → "h:MM AM/PM"
function formatTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m ?? 0).padStart(2, "0")} ${ampm}`;
}

// Format "YYYY-MM-DD" → "Fri, Oct 31, 2025"
function formatFullDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function WeekInMusicApp({ data, editable = false }) {
  // Public is read-only; 'editable' is ignored here intentionally.
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [query, setQuery] = useState("");

  // Count entries per day (for the dropdown labels)
  const dayCounts = useMemo(() => {
    const map = {};
    for (const d of WEEKDAY_LABELS) map[d] = (data?.days?.[d] ?? []).length;
    return map;
  }, [data]);

  // Events for the selected day (filtered by search)
  const eventsForSelected = useMemo(() => {
    const list = data?.days?.[selectedDay] ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((e) =>
      [e.venue, e.artist, e.title].filter(Boolean).some((v) => v.toLowerCase().includes(q))
    );
  }, [data, selectedDay, query]);

  // Determine header date for the selected day.
  // If all entries share a single date, show it in the header; otherwise omit.
  const headerDate = useMemo(() => {
    const list = data?.days?.[selectedDay] ?? [];
    const unique = Array.from(new Set(list.map((e) => e.date).filter(Boolean)));
    if (unique.length === 1) return formatFullDate(unique[0]);
    return null; // multiple/none -> don't show a possibly confusing date
  }, [data, selectedDay]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-wm-leather via-wm-accent to-wm-amber text-white p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
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
            <p className="text-white/85 text-sm">Venues • Artists • Times</p>
          </div>
        </div>
      </div>

      {/* Controls: Day dropdown + search */}
      <div className="bg-white border rounded-2xl shadow-soft p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <label className="md:col-span-1 text-sm font-medium">
            Choose a day
            <select
              className="mt-1 w-full border rounded-xl px-3 py-2 bg-white"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              aria-label="Choose day of week"
            >
              {WEEKDAY_LABELS.map((d) => (
                <option key={d} value={d}>
                  {d} ({dayCounts[d]})
                </option>
              ))}
            </select>
          </label>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">
              Search this day
              <input
                className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder={`Search ${selectedDay} by venue/artist`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search events"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Selected day header (with the date moved up here) */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">{selectedDay}</h2>
          {headerDate && (
            <div className="text-sm text-neutral-600">{headerDate}</div>
          )}
        </div>
        <div className="text-sm text-neutral-600">
          {eventsForSelected.length} show{eventsForSelected.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Listing: ONLY Venue • Artist • Time */}
      {eventsForSelected.length === 0 ? (
        <p className="text-sm text-neutral-600">No shows for {selectedDay}.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {eventsForSelected.map((ev, i) => (
            <li key={`${ev.venue}-${ev.artist}-${ev.time}-${i}`} className="bg-white border rounded-2xl shadow-soft p-4">
              <div className="font-semibold">{ev.venue}</div>
              <div className="text-sm text-neutral-600">{ev.artist || "Artist TBA"}</div>
              <div className="text-sm mt-1">{formatTime(ev.time)}</div>
            </li>
          ))}
        </ul>
      )}

      <footer className="text-sm text-neutral-500">Built with ♥ for local music.</footer>
    </div>
  );
}
