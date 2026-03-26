/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        engineering: {
          navy: '#1B2A4A',
          electric: '#2563EB',
          amber: '#F59E0B',
          green: '#10B981',
          red: '#EF4444',
          slate: '#F1F5F9',
        }
      },
      fontFamily: {
        technical: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
