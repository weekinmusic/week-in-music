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
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nxt = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && nxt === '"') {
        field += '"'; i++; // escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field.trim());
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        // end of row (support \r\n)
        if (field.length || row.length) {
          row.push(field.trim());
          rows.push(row);
          row = [];
          field = "";
        }
        // skip \r\n combo by letting loop continue
      } else {
        field += ch;
      }
    }
  }
  if (field.length || row.length) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
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
    async function handleLogout() {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login";
}return { days };
  }, []);
  async function handleLogout() {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login";
}

  const [data, setData] = useState(normalized);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [newEv, setNewEv] = useState(emptyEvent());
  const [search, setSearch] = useState("");
  const [importMode, setImportMode] = useState("append"); // "append" | "replace"
  const [importStatus, setImportStatus] = useState("");

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

  async function copyWeekJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setImportStatus("Copied JSON to clipboard.");
      setTimeout(() => setImportStatus(""), 2000);
    } catch {
      setImportStatus("Copy failed. Your browser may block clipboard access.");
      setTimeout(() => setImportStatus(""), 3000);
    }
  }

  function downloadCsvTemplate() {
    const header = ["venue", "venueUrl", "artist", "date", "time"].join(",");
    const example = [
      "Bluebird Bar,https://bluebirdbar.com,The Rivets,2025-10-31,19:00",
      "Ivory Lounge,https://ivoryloungedfw.com,Kip Richard Trio,2025-10-31,21:30",
    ].join("\n");
    const file = new Blob([header + "\n" + example], { type: "text/csv" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = `week-template-${selectedDay}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function onCsvSelected(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result.toString();
        const rows = parseCSV(text);
        if (!rows.length) throw new Error("No rows found.");

        // Expect header: venue,venueUrl,artist,date,time (any order acceptable)
        const header = rows[0].map((h) => h.toLowerCase().trim());
        const idxVenue = header.indexOf("venue");
        const idxVenueUrl = header.indexOf("venueurl");
        const idxArtist = header.indexOf("artist");
        const idxDate = header.indexOf("date");
        const idxTime = header.indexOf("time");

        if (idxVenue === -1 || idxDate === -1 || idxTime === -1) {
          throw new Error(
            'CSV must have at least "venue", "date", and "time" columns.'
          );
        }

        const newItems = [];
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          if (!r || r.length === 0) continue;
          const venue = r[idxVenue] || "";
          const venueUrl = idxVenueUrl !== -1 ? r[idxVenueUrl] || "" : "";
          const artist = idxArtist !== -1 ? r[idxArtist] || "" : "";
          const date = r[idxDate] || "";
          const time = r[idxTime] || "";
          if (!venue && !date && !time) continue; // skip empty lines
          newItems.push({ venue, venueUrl, artist, date, time });
        }

        if (!newItems.length) throw new Error("No valid rows to import.");

        setData((prev) => {
          const copy = { ...prev.days };
          copy[selectedDay] =
            importMode === "replace"
              ? newItems
              : [...newItems, ...(copy[selectedDay] || [])];
          return { days: copy };
        });

        setImportStatus(
          `Imported ${newItems.length} item(s) into ${selectedDay} (${importMode}).`
        );
        setTimeout(() => setImportStatus(""), 4000);
      } catch (e) {
        setImportStatus(`Import error: ${e.message}`);
        setTimeout(() => setImportStatus(""), 5000);
      }
    };
    reader.readAsText(file);
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
            Edit the weekly lineup privately. Then{" "}
            <strong>Download week.json</strong> or <strong>Copy JSON</strong> and
            commit it to <code>data/week.json</code> in GitHub.
          </p>
        </div>
        <div className="flex gap-2">
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
        </div>
      </header>

      {/* Day + Search */}
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

      {/* CSV Import */}
      <section className="bg-white border rounded-2xl shadow p-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium block">
              Import CSV into <strong>{selectedDay}</strong>
              <input
                type="file"
                accept=".csv,text/csv"
                className="mt-1 block w-full border rounded-xl px-3 py-2 bg-white"
                onChange={(e) => onCsvSelected(e.target.files?.[0] || null)}
              />
            </label>
            <p className="text-xs text-neutral-600 mt-1">
              Expected columns (any order): <code>venue</code>,{" "}
              <code>venueUrl</code>, <code>artist</code>, <code>date</code>,{" "}
              <code>time</code>. Date format: <code>YYYY-MM-DD</code>. Time:
              <code>HH:MM</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">
              Mode
              <select
                className="mt-1 ml-2 border rounded-xl px-3 py-2 bg-white"
                value={importMode}
                onChange={(e) => setImportMode(e.target.value)}
              >
                <option value="append">Append</option>
                <option value="replace">Replace</option>
              </select>
            </label>

            <button
              onClick={downloadCsvTemplate}
              className="px-3 py-2 rounded-xl border bg-white hover:bg-neutral-50"
              type="button"
            >
              CSV Template
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="mt-3 text-sm text-neutral-700">{importStatus}</div>
        )}
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
            Total this week:{" "}
            {DAYS.reduce((sum, d) => sum + (data.days[d]?.length || 0), 0)}
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
                  Preview: <strong>{ev.venue || "Venue"}</strong> —{" "}
                  {ev.artist || "Artist TBA"} — {formatTime(ev.time || "")}{" "}
                  {ev.date ? `• ${ev.date}` : ""}
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
          Use <strong>Copy JSON</strong> to paste directly into GitHub, or{" "}
          <strong>Download week.json</strong> and upload it to{" "}
          <code>data/week.json</code>.
        </p>
      </section>
    </main>
  );
}
