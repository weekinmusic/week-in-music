import data from "../data/week.json";
import WeekInMusicApp from "../components/WeekInMusicApp.jsx";

export default function HomePage() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <WeekInMusicApp data={data} editable={false} />
    </main>
  );
}
