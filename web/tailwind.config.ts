import type { Config } from "tailwindcss";

// Same design tokens as the original site (index.html tailwind.config).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f8f8f6",
        primary: "#0a0a0a",
        secondary: "#555555",
        accent: "#777777",
        surface: "#ebebe6",
        surfaceLight: "#f0f0eb",
        skeleton: "#e4e4e0",
      },
      fontFamily: { sans: ["var(--font-inter)", "Inter", "sans-serif"] },
      letterSpacing: { tighter: "-0.06em", tight: "-0.03em", widest: "0.25em" },
      boxShadow: {
        premium: "0 20px 40px -15px rgba(0,0,0,0.05)",
        "premium-hover": "0 30px 60px -15px rgba(0,0,0,0.12)",
        "premium-dark": "0 40px 80px -20px rgba(0,0,0,0.8)",
      },
      transitionTimingFunction: { premium: "cubic-bezier(0.16, 1, 0.3, 1)" },
    },
  },
  plugins: [],
};

export default config;
