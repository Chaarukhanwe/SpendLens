/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0d1117",
        surface: "#161b22",
        surface2: "#21262d",
        border: "#30363d",
        blue: { DEFAULT: "#388bfd", dim: "#1f6feb", glow: "#388bfd18" },
        green: { DEFAULT: "#3fb950", dim: "#238636" },
        red: { DEFAULT: "#f85149" },
        yellow: { DEFAULT: "#d29922" },
        muted: "#8b949e",
        dimmer: "#484f58",
        primary: "#e6edf3",
      },
      fontFamily: {
        mono: ["'SF Mono'", "ui-monospace", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(#30363d 1px, transparent 1px), linear-gradient(90deg, #30363d 1px, transparent 1px)",
      },
      backgroundSize: { grid: "40px 40px" },
      borderRadius: { lg: "0.5rem", md: "0.375rem", sm: "0.25rem" },
      keyframes: {
        spin: { to: { transform: "rotate(360deg)" } },
        "fade-in": { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        spin: "spin 0.7s linear infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
