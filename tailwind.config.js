/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        navy: "#132040",
        navy2: "#1B2B4D",
        line: "#233252",
        gold: "#C99A2E",
        cream: "#F5EFE3",
        muted: "#8A93A8",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "Impact", "sans-serif"],
        body: ['Inter', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,.03), 0 8px 24px -12px rgba(0,0,0,.6)",
      },
      keyframes: {
        sheetUp: { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
        pop: { "0%": { transform: "scale(.96)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
      },
      animation: {
        sheetUp: "sheetUp .28s cubic-bezier(.22,1,.36,1)",
        fade: "fade .2s ease",
        pop: "pop .18s ease",
      },
    },
  },
  plugins: [],
};
