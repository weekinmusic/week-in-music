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

      {/* Your existing editor / daily listings section continues below */}
      <section>
        {/* Event editing UI */}
      </section>
    </main>
  );
}
