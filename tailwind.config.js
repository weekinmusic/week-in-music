/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wm: {
          ink: "#111111",
          sand: "#faf8f5",
          ivory: "#fffdf7",
          amber: "#f59e0b",
          cocoa: "#6b4f3b",
          leather: "#3b2f2f",
          accent: "#b45309"
        }
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    },
  },
  plugins: [],
};
