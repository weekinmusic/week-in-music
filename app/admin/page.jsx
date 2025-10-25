"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  // --- fetch week.json on load ---
  useEffect(() => {
    fetch("/api/week")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((e) => setError("Failed to load week.json: " + e.message));
  }, []);

  // --- logout ---
  function logout() {
    document.cookie = "session-token=; Max-Age=0; path=/";
    router.push("/login");
  }

  // --- copy JSON ---
  function copyWeekJson() {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("week.json copied to clipboard!");
  }

  // --- download JSON ---
  function downloadWeekJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "week.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- test GitHub connection ---
  async function testGithubConnection() {
    try {
      const res = await fetch("/api/github?test=true");
      if (res.ok) alert("✅ GitHub connection is working!");
      else alert("⚠️ GitHub connection failed.");
    } catch (err) {
      alert("❌ Error testing GitHub connection: " + err.message);
    }
  }

  // --- publish to GitHub ---
  async function publishToGitHub() {
    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (res.ok) {
        alert("✅ week.json has been published to GitHub successfully!");
      } else {
        const text = await res.text();
        alert("⚠️ GitHub publish failed:\n" + text);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error connecting to GitHub.");
    }
  }

  // --- normalize and parse CSV ---
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

  function csvToWeekJson(csvText) {
    const rows = parseCSV(csvText).filter(r => r.length && r.some(x => x !== ""));
    if (rows.length < 2) throw new Error("CSV has no data rows");

    const header = rows[0].map(h => h.toLowerCase());
    const idx = (name) => header.indexOf(name);
    const iDay = idx("day");
    const iDate = idx("date");
    const iCity = idx("city");
    const iVenue = idx("venue");
    const iUrl = idx("venueurl");
    const iArtist = idx("artist");
    const iTime = idx("time");

    const out = {
      days: {
        Monday: [], Tuesday: [], Wednesday: [],
        Thursday: [], Friday: [], Saturday: [], Sunday: []
      },
    };

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const day = normalizeDay(row[iDay]);
      if (!day) continue;
      const date = iDate !== -1 ? (row[iDate] || "").trim() : "";
      const city = (row[iCity] || "").trim();
      const venue = (row[iVenue] || "").trim();
      const venueUrl = iUrl !== -1 ? (row[iUrl] || "").trim() : "";
      const artist = (row[iArtist] || "").trim();
      const time = (row[iTime] || "").trim();
      if (!venue || !artist || !time) continue;
      out.days[day].push({ city, venue, venueUrl, artist, time, date });
    }

    return out;
  }

  function mergeWeekData(current, incoming) {
    const next = JSON.parse(JSON.stringify(current || { days: {} }));
    Object.keys(incoming.days || {}).forEach(day => {
      if (!next.days[day]) next.days[day] = [];
      for (const ev of incoming.days[day]) {
        const dup = next.days[day].some(e =>
          (e.city||"")===(ev.city||"") &&
          (e.venue||"")===(ev.venue||"") &&
          (e.artist||"")===(ev.artist||"") &&
          (e.time||"")===(ev.time||"")
        );
        if (!dup) next.days[day].push(ev);
      }
    });
    return next;
  }

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

  if (!data) return <p className="p-6 text-neutral-600">Loading admin dashboard…</p>;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-[#3e2f1c] mb-4">Week in Music Admin</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={testGithubConnection}
          className="px-4 py-2 rounded-xl bg-[#bfa97a] text-[#3e2f1c] hover:bg-[#d1b97c] transition"
        >
          Test GitHub Connection
        </button>
        <button
          onClick={copyWeekJson}
          className="px-4 py-2 rounded-xl bg-[#bfa97a] text-[#3e2f1c] hover:bg-[#d1b97c] transition"
        >
          Copy JSON
        </button>
        <button
          onClick={downloadWeekJson}
          className="px-4 py-2 rounded-xl bg-[#bfa97a] text-[#3e2f1c] hover:bg-[#d1b97c] transition"
        >
          Download week.json
        </button>

        {/* ✅ Publish button restored */}
        <button
          onClick={publishToGitHub}
          className="px-4 py-2 rounded-xl bg-[#6b4b26] text-white hover:bg-[#4a3219] transition"
        >
          Publish to GitHub
        </button>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-[#ccc] text-[#222] hover:bg-[#bbb] transition"
        >
          Logout
        </button>
      </div>

      {/* CSV Import */}
      <section className="rounded-2xl border border-neutral-200 p-4 bg-white/70">
        <h3 className="text-lg font-semibold mb-2">Import weekly listings from CSV</h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="importMode"
              defaultChecked
              onChange={() => (window.__importMode = "replace")}
            />
            <span>Replace current data</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="importMode"
              onChange={() => (window.__importMode = "merge")}
            />
            <span>Merge with current data (dedupe)</span>
          </label>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) =>
              handleCsvFile(e.target.files?.[0] || null, window.__importMode || "replace")
            }
            className="block"
          />
        </div>
        <p className="text-sm text-neutral-600 mt-2">
          CSV header required: <code>day,date,city,venue,venueUrl,artist,time</code>.
          After import, click <strong>Publish to GitHub</strong> to push live updates.
        </p>
      </section>
    </main>
  );
}
