/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tactical: {
          bg: "#0B0F19",
          panel: "#111827",
          card: "#1F2937",
          border: "#374151",
          accent: "#3B82F6",
          red: "#EF4444",
          amber: "#F59E0B",
          green: "#10B981",
          cyan: "#06B6D4",
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'spin 4s linear infinite',
      }
    },
  },
  plugins: [],
}
