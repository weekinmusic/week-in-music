export const metadata = {
  title: "Week in Music",
  description: "Your weekly guide to live music — venues, artists, and the calendar.",
};

import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-wm-sand text-wm-ink`}>
        {children}
      </body>
    </html>
  );
}
