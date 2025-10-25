import { useEffect, useState } from "react";

export default function HomePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      const res = await fetch(
        "https://raw.githubusercontent.com/weekinmusic/week-in-music/main/data/week.json"
      );
      const json = await res.json();
      setData(json);
    }
    loadData();
  }, []);

  if (!data) return <p className="text-center mt-8 text-neutral-600">Loading schedule…</p>;

  return (
    // Your component that renders WeekInMusicApp or similar
    <WeekInMusicApp data={data} />
  );
}
import WeekInMusicApp from "../components/WeekInMusicApp.jsx";

export default function HomePage() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <WeekInMusicApp data={data} editable={false} />
    </main>
  );
}
