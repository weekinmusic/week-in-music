"use client";

console.log("🎸 WeekInMusicApp received data:", data);

import { useState } from "react";
export default function WeekInMusicApp({ data }) {
  // everything else stays the same
}
import { Clock, Guitar } from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function WeekInMusicApp() {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedCity, setSelectedCity] = useState("All");

  const list = data.days[selectedDay] || [];

  // ✅ Group by city → venue
  const groupedByCity = list.reduce((acc, ev) => {
    const city = ev.city || "Other";
    if (!acc[city]) acc[city] = {};
    const venue = ev.venue;
    if (!acc[city][venue]) acc[city][venue] = [];
    acc[city][venue].push(ev);
    return acc;
  }, {});

  const allCities = ["All", ...Object.keys(groupedByCity)];
  const bgColors = ["bg-[#f8f5f0]", "bg-[#fffdfa]"];

  // ✅ Filter by selected city
  const displayCities =
    selectedCity === "All"
      ? groupedByCity
      : { [selectedCity]: groupedByCity[selectedCity] };

  // Get date for header (first event’s date if present)
  const headerDate = list.length > 0 && list[0].date ? list[0].date : "";

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Custom smooth pulse animation */}
      <style jsx>{`
        @keyframes smoothPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.85;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-smoothPulse {
          animation: smoothPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-center md:text-left flex items-center gap-2 text-[#3e2f1c] group">
          <Guitar className="w-8 h-8 text-[#6b4b26] group-hover:animate-smoothPulse" />
          Week in Music
        </h1>

        {/* Day & City selectors */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-end">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="border rounded-xl px-3 py-2 text-lg shadow-sm border-[#bfa97a] bg-[#fffaf2] text-[#3e2f1c]"
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border rounded-xl px-3 py-2 text-lg shadow-sm border-[#bfa97a] bg-[#fffaf2] text-[#3e2f1c]"
          >
            {allCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 🗓️ Day + Date header */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-[#3e2f1c]">
          {selectedDay}
          {headerDate && (
            <span className="text-lg font-normal text-[#6b4b26] ml-2">
              • {headerDate}
            </span>
          )}
        </h2>
      </div>

      {/* Listings grouped by city */}
      {Object.keys(displayCities).length === 0 ? (
        <p className="text-neutral-500 text-center">
          No events listed for {selectedDay}.
        </p>
      ) : (
        Object.entries(displayCities).map(([city, venues], cityIndex) => (
          <section key={city} className="space-y-6">
            {/* City heading */}
            <h3 className="text-2xl font-bold text-[#6b4b26] border-b border-[#bfa97a] pb-1">
              {city}
            </h3>

            {/* Venues */}
            {venues &&
              Object.entries(venues).map(([venue, shows], venueIndex) => (
                <div
                  key={venue}
                  className={`${bgColors[venueIndex % 2]} rounded-2xl shadow-sm border border-[#bfa97a] p-5 transition hover:shadow-md`}
                >
                  {/* Venue name */}
                  <h4 className="text-xl font-semibold text-[#3e2f1c] flex items-center gap-2 group">
                    <Guitar className="w-5 h-5 text-[#6b4b26] group-hover:animate-smoothPulse" />
                    {shows[0].venueUrl ? (
                      <a
                        href={shows[0].venueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {venue}
                      </a>
                    ) : (
                      venue
                    )}
                  </h4>

                  {/* Performances */}
                  <div className="pl-7 mt-2 space-y-1 text-[#2b1e11]">
                    {shows.map((s, j) => (
                      <p key={j} className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-[#a67b4d]" />
                        <span className="font-medium text-[#3e2f1c]">
                          {s.time}
                        </span>
                        <span>— {s.artist}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
          </section>
        ))
      )}
    </main>
  );
}
