import type { Config } from "tailwindcss";

// Palette mirrors mzalendo.com's core.css tokens (primary hsl 358 81% 41%,
// secondary hsl 144 100% 25%, Montserrat).
// Border radii upgraded to 2026 standards while card-border stays at 4px for
// small inline elements (chips, badges) that need sharp edges.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mz: {
          red: "#bd1419",
          "red-dark": "#700f12",
          maroon: "#8d1820",
          green: "#008033",
          "green-dark": "#00661a",
          text: "#1a1a1a",
          muted: "#5c5c5c",
          border: "#e8e8e8",
          subtle: "#f6f6f6",
          surface: "#ffffff",
          glass: "rgba(255,255,255,0.82)",
        },
        band: {
          clear: "#008033",
          low: "#9a6b00",
          elevated: "#c2410c",
          high: "#7a1620",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
      },
      borderRadius: {
        mz: "4px",      // chips, stamps, small inline elements
        card: "12px",   // cards, stat blocks, panels
        xl2: "16px",    // hero panels
        pill: "9999px", // rating badges
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.10), 0 12px 32px rgba(0,0,0,0.08)",
        glass: "0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        inner: "inset 0 1px 2px rgba(0,0,0,0.06)",
      },
      backdropBlur: { nav: "16px" },
      transitionDuration: { "250": "250ms" },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        rise: "rise 0.55s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.4s ease both",
        "slide-up": "slide-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
