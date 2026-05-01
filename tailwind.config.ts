import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8"
        },
        lux: {
          ink: "#0c1222",
          surface: "#121a2b",
          muted: "#8b93a7",
          line: "rgba(148, 163, 184, 0.12)",
          gold: "#c9a962",
          "gold-dim": "#9a7b3c",
          paper: "#f0ebe3",
          "paper-deep": "#e3ddd2"
        }
      },
      boxShadow: {
        lux: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px -24px rgba(0,0,0,0.45)"
      }
    }
  },
  plugins: []
};

export default config;
