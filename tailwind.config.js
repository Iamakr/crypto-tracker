/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f8fc',
          100: '#ccf1f9',
          200: '#99e3f3',
          300: '#66d5ed',
          400: '#33c7e7',
          500: '#00b9e1',
          600: '#0094b4',
          700: '#006f87',
          800: '#00495a',
          900: '#00242d',
        },
        background: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          dark: '#060c19',
        },
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} 