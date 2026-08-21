import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void:    "#080B14",
        surface: "#0D1117",
        card:    "#111827",
        border:  "#1F2937",
        purple:  { DEFAULT: "#7C3AED", light: "#A78BFA", dark: "#5B21B6" },
        blue:    { DEFAULT: "#3B82F6", light: "#93C5FD" },
        cyan:    { DEFAULT: "#06B6D4", light: "#67E8F9" },
        green:   { DEFAULT: "#10B981", light: "#6EE7B7" },
        red:     { DEFAULT: "#EF4444", light: "#FCA5A5" },
        yellow:  { DEFAULT: "#F59E0B", light: "#FCD34D" },
        slate:   { 400: "#94A3B8", 500: "#64748B", 600: "#475569", 700: "#334155", 800: "#1E293B", 900: "#0F172A" },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body:    ["Inter", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-purple": "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)",
        "glow-blue":   "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)",
      },
      boxShadow: {
        "glow-sm":    "0 0 20px rgba(124,58,237,0.2)",
        "glow-md":    "0 0 40px rgba(124,58,237,0.25)",
        "glow-cyan":  "0 0 20px rgba(6,182,212,0.2)",
        "glow-green": "0 0 20px rgba(16,185,129,0.2)",
        "card":       "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)",
      },
      animation: {
        "fade-in":     "fadeIn 0.3s ease-out",
        "slide-up":    "slideUp 0.4s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "pulse-slow":  "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer":     "shimmer 1.5s infinite",
        "count-up":    "countUp 0.6s ease-out",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" },               "100%": { opacity: "1" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideRight:{ "0%": { opacity: "0", transform: "translateX(-16px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        shimmer:   { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        countUp:   { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
