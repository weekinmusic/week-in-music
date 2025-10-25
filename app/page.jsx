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
          { cache: "no-store" } // ✅ disables caching
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load week.json:", err);
      }
    }
    loadData();
  }, []);

  if (!data)
    return (
      <p className="text-center mt-10 text-neutral-600">
        Loading latest schedule…
      </p>
    );

  return <WeekInMusicApp data={data} />;
}
