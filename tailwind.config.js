/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1d1d1f",
          soft: "#6b7280",
          faint: "#9ca3af",
        },
        accent: {
          DEFAULT: "#4f46e5",
          hover: "#4338ca",
          soft: "#eef2ff",
        },
        canvas: "#f5f5f7",
        card: "#ffffff",
        line: "#ececf0",
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        md: '6px',
      },
    },
  },
  plugins: [],
};
