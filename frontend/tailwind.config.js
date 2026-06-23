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
        darkBg: "#060913",
        darkCard: "rgba(17, 24, 43, 0.75)",
        darkBorder: "rgba(255, 255, 255, 0.08)",
        neonBlue: "#00F0FF",
        neonPurple: "#A855F7",
        neonGreen: "#10B981",
        neonOrange: "#F97316",
        neonRed: "#EF4444",
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 15px rgba(0, 240, 255, 0.25)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
