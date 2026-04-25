/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0A0F",
          900: "#13131A",
          800: "#1C1C26",
          700: "#2A2A38",
          600: "#3D3D52",
          500: "#5A5A75",
          400: "#7A7A8C",
          300: "#A0A0B0",
        },
        neon: "#C8FF00",
        magenta: "#FF2E63",
        cyan: "#00E0FF",
      },
      fontFamily: {
        display: ['"Monoton"', "system-ui", "sans-serif"],
        head: ['"Anton"', "Impact", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan": "scan 8s linear infinite",
        "glitch": "glitch 4s steps(1) infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "flicker": "flicker 5s linear infinite",
        "rise": "rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        glitch: {
          "0%, 96%, 100%": { transform: "translate(0)", filter: "none" },
          "97%": { transform: "translate(-2px, 1px)", filter: "hue-rotate(90deg)" },
          "98%": { transform: "translate(2px, -1px)" },
          "99%": { transform: "translate(-1px, 0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.4" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
