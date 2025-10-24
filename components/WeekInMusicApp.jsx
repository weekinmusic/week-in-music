"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

// ✅ Full day names
const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function formatTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m ?? 0).padStart(2, "0")} ${ampm}`;
}

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

export default function WeekInMusicApp({ data }) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [query, setQuery] = useState("");

  // Counts per day
  const dayCounts = useMemo(() => {
    const map = {};
    for (const d of WEEKDAY_LABELS) map[d] = (data?.days?.[d] ?? []).length;
    return map;
  }, [data]);

  // Filtered events for selected day
  const eventsForSelected = useMemo(() => {
    const list = data?.days?.[selectedDay] ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((e) =>
      [e.venue, e.artist, e.title]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [data, selectedDay, query]);

  // Determine date to show under day name
  const headerDate = useMemo(() => {
    const list = data?.days?.[selectedDay] ?? [];
    const unique = Array.from(new Set(list.map((e) => e.date).filter(Boolean)));
    if (unique.length === 1) return formatFullDate(unique[0]);
    return null;
  }, [data, selectedDay]);

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Day + Search */}
      <div className="bg-white border rounded-2xl shadow-soft p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <label className="md:col-span-1 text-sm font-medium">
            Choose a day
            <select
              className="mt-1 w-full border rounded-xl px-3 py-2 bg-white"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
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
              />
            </label>
          </div>
        </div>
      </div>

      {/* Day header */}
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

      {/* Listings — one line, clickable venue */}
      {eventsForSelected.length === 0 ? (
        <p className="text-sm text-neutral-600">No shows for {selectedDay}.</p>
      ) : (
        <ul className="bg-white border rounded-2xl shadow-soft divide-y divide-neutral-200">
          {eventsForSelected.map((ev, i) => (
            <li
              key={`${ev.venue}-${ev.artist}-${i}`}
              className="px-4 py-3 flex justify-between items-center"
            >
              {/* Venue (clickable link if venueUrl exists) */}
              {ev.venueUrl ? (
                <a
                  href={ev.venueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-bold text-wm-ink hover:text-wm-accent transition"
                  title={`Visit ${ev.venue}`}
                >
                  {ev.venue}
                </a>
              ) : (
                <span className="text-base font-bold text-wm-ink">{ev.venue}</span>
              )}

              {/* Artist */}
              <span className="flex-1 text-sm text-neutral-700 text-center truncate">
                {ev.artist || "Artist TBA"}
              </span>

              {/* Time */}
              <span className="text-sm font-semibold text-wm-accent">
                {formatTime(ev.time)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <footer className="text-sm text-neutral-500 text-center">
        Built with ♥ for local music.
      </footer>
    </div>
  );
}
