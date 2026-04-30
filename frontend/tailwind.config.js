/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          50:  "#f0faf4",
          100: "#dcf5e7",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        accent: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        dark: {
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#080f1c",
        }
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(160deg, #080f1c 0%, #0f172a 60%, #0f2318 100%)",
        "card-gradient":  "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(249,115,22,0.05) 100%)",
      },
      boxShadow: {
        "glow":      "0 0 16px rgba(34,197,94,0.25)",
        "glow-orange": "0 0 16px rgba(249,115,22,0.25)",
      },
      animation: {
        "fade-in":    "fadeIn 0.35s ease-out",
        "slide-up":   "slideUp 0.35s ease-out",
        "pulse-slow": "pulse 4s infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
