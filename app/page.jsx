"use client";
import { useEffect, useState } from "react";
import WeekInMusicApp from "../components/WeekInMusicApp";

export default function HomePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/weekinmusic/week-in-music/main/data/week.json",
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log("✅ Loaded live data:", json);
        setData(json);
      } catch (err) {
        console.error("❌ Failed to load week.json:", err);
      }
    }
    loadData();
  }, []);

  if (!data) {
    return (
      <main className="max-w-5xl mx-auto p-10 text-center text-neutral-600">
        <p>Loading latest schedule…</p>
      </main>
    );
  }

  return <WeekInMusicApp data={data} />;
}
