/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A',       // slate-900
          card: '#1E293B',     // slate-800
          border: '#334155',   // slate-700
          text: '#F8FAFC',     // slate-50
          muted: '#94A3B8',    // slate-400
        },
        primary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#10B981',      // emerald-500
          600: '#059669',      // emerald-600
          700: '#047857',      // emerald-700
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
