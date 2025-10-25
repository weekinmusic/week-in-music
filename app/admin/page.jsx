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

// Tiny CSV parser that handles quoted fields with commas.
function parseCSV(text) {
  const rows = [];
  let current = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && next === '"') {
      currentValue += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      current.push(currentValue.trim());
      currentValue = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (current.length > 0 || currentValue) {
        current.push(currentValue.trim());
        rows.push(current);
        current = [];
        currentValue = "";
      }
    } else {
      currentValue += char;
    }
  }
  if (currentValue || current.length > 0) {
    current.push(currentValue.trim());
    rows.push(current);
  }
  return rows;
}

export default function AdminPage() {
  const [data, setData] = useState(dataInitial);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    const base = data.days[selectedDay] || [];
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((e) =>
      [e.venue, e.artist, e.time]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [data, selectedDay, search]);

  // ✅ Logout Function
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  // ✅ Test GitHub Connection
  async function testGitHubConnection() {
    try {
      const res = await fetch("/api/week", { method: "GET" });
      if (!res.ok) {
        const text = await res.text();
        alert(`❌ GitHub connection failed:\n${text}`);
        return;
      }
      const json = await res.json();
      if (json.days) {
        alert("✅ GitHub connection successful!");
      } else {
        alert("⚠️ GitHub responded but data format unexpected.");
      }
    } catch (err) {
      alert(`❌ Error testing connection: ${err.message}`);
    }
  }

  async function copyWeekJson() {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("📋 Copied week.json to clipboard");
  }

  function downloadWeekJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "week.json";
    a.click();
  }

  async function publishToGitHub() {
    const res = await fetch("/api/week", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (res.ok) alert("✅ Published to GitHub successfully!");
    else alert("❌ Error publishing");
  }

  // 🧩 Return Section with Toolbar
  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4">Week in Music Admin</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={testGitHubConnection}
          className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50"
        >
          Test GitHub Connection
        </button>

        // Normalize "day" to full name (case-insensitive). Returns null if invalid.
function normalizeDay(s) {
  const m = (s || "").trim().toLowerCase();
  const map = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };
  return map[m] || null;
}

// Turn CSV text → our week.json shape { days: { DayName: [ ...events ] } }
function csvToWeekJson(csvText) {
  // Simple CSV parse (handles quotes) – use your existing parseCSV if you already have it.
  function parseCSV(text) {
    const rows = [];
    let cell = "";
    let row = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const n = text[i + 1];

      if (c === '"' && n === '"') { cell += '"'; i++; continue; }
      if (c === '"') { inQuotes = !inQuotes; continue; }
      if (c === "," && !inQuotes) { row.push(cell); cell = ""; continue; }
      if ((c === "\n" || c === "\r") && !inQuotes) {
        if (cell.length || row.length) { row.push(cell); rows.push(row); }
        cell = ""; row = [];
        continue;
      }
      cell += c;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.map(r => r.map(x => x.trim()));
  }

  const rows = parseCSV(csvText).filter(r => r.length && r.some(x => x !== ""));
  if (rows.length < 2) throw new Error("CSV has no data rows");

  // Header map
  const header = rows[0].map(h => h.toLowerCase());
  const idx = (name) => header.indexOf(name);
  const need = ["day","city","venue","artist","time"];
  need.forEach(n => { if (idx(n) === -1) throw new Error(`Missing column: ${n}`); });

  const iDay = idx("day");
  const iDate = idx("date");
  const iCity = idx("city");
  const iVenue = idx("venue");
  const iUrl = idx("venueurl"); // optional
  const iArtist = idx("artist");
  const iTime = idx("time");

  const out = { days: {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  } };

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const day = normalizeDay(row[iDay]);
    if (!day) continue; // skip invalid day rows
    const city = (row[iCity] || "").trim();
    const venue = (row[iVenue] || "").trim();
    const venueUrl = iUrl !== -1 ? (row[iUrl] || "").trim() : "";
    const artist = (row[iArtist] || "").trim();
    const time = (row[iTime] || "").trim();

    if (!city || !venue || !artist || !time) continue; // require key fields

    const date = iDate !== -1 ? (row[iDate] || "").trim() : "";
out.days[day].push({ city, venue, venueUrl, artist, time, date });
  }

  // Optional: sort each day by venue then time
  const order = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  Object.keys(out.days).forEach(day => {
    out.days[day].sort((a, b) => {
      const v = order(a.venue || "", b.venue || "");
      if (v !== 0) return v;
      return order(a.time || "", b.time || "");
    });
  });

  return out;
}

// Merge helper: combine existing data with new (avoid duplicates)
function mergeWeekData(current, incoming) {
  const next = JSON.parse(JSON.stringify(current || { days: {} }));
  const seen = new Set();

  Object.keys(incoming.days || {}).forEach(day => {
    if (!next.days[day]) next.days[day] = [];
    for (const ev of incoming.days[day]) {
      const key = [day, ev.city || "", ev.venue || "", ev.artist || "", ev.time || ""].join("||");
      if (seen.has(key)) continue;
      // prevent dup with current too
      const dup = next.days[day].some(e =>
        (e.city||"")===(ev.city||"") &&
        (e.venue||"")===(ev.venue||"") &&
        (e.artist||"")===(ev.artist||"") &&
        (e.time||"")===(ev.time||"")
      );
      if (!dup) next.days[day].push(ev);
      seen.add(key);
    }
  });
  return next;
}

// Handle CSV file input
async function handleCsvFile(file, mode = "replace") {
  if (!file) return;
  const text = await file.text();
  let incoming;
  try {
    incoming = csvToWeekJson(text);
  } catch (e) {
    alert(`CSV error: ${e.message}`);
    return;
  }

  if (mode === "replace") {
    setData(incoming);
    alert("CSV imported (replaced current data). Review, then Publish to GitHub.");
  } else {
    const merged = mergeWeekData(data, incoming);
    setData(merged);
    alert("CSV imported (merged with current data). Review, then Publish to GitHub.");
  }
}
    
        <button
          onClick={copyWeekJson}
          className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50"
        >
          Copy JSON
        </button>

        <button
          onClick={downloadWeekJson}
          className="px-3 py-2 rounded-xl bg-black text-white hover:opacity-90"
        >
          Download week.json
        </button>

        <button
          onClick={publishToGitHub}
          className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:opacity-90"
        >
          Publish to GitHub
        </button>

        <button
          onClick={handleLogout}
          className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50"
        >
          Logout
        </button>
      </div>

        {/* CSV Import */}
<section className="rounded-2xl border border-neutral-200 p-4 bg-white/70">
  <h3 className="text-lg font-semibold mb-2">Import weekly listings from CSV</h3>

  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
    <label className="inline-flex items-center gap-2">
      <input type="radio" name="importMode" defaultChecked
             onChange={() => (window.__importMode = "replace")} />
      <span>Replace current data</span>
    </label>

    <label className="inline-flex items-center gap-2">
      <input type="radio" name="importMode"
             onChange={() => (window.__importMode = "merge")} />
      <span>Merge with current data (dedupe)</span>
    </label>

    <input
      type="file"
      accept=".csv,text/csv"
      onChange={(e) => handleCsvFile(e.target.files?.[0] || null, window.__importMode || "replace")}
      className="block"
    />
  </div>

  <p className="text-sm text-neutral-600 mt-2">
    CSV header required: <code>day,city,venue,venueUrl,artist,time</code>.
    Days should be full names (Monday–Sunday). After import, click <strong>Publish to GitHub</strong>.
  </p>
</section>
        
      {/* Your existing editor / daily listings section continues below */}
      <section>
        {/* Event editing UI */}
      </section>
    </main>
  );
}
