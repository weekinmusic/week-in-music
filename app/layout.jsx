export const metadata = {
  title: "Week in Music",
  description: "Your weekly guide to live music — venues, artists, and the calendar."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, Arial, sans-serif", background: "#fafafa", color: "#111" }}>
        {children}
      </body>
    </html>
  );
}
