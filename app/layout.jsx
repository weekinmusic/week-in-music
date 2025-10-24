export const metadata = {
  title: "Week in Music",
  description: "Your weekly guide to live music — venues, artists, and the calendar."
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
