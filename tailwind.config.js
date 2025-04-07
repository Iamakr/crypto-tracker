/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-success',
    'bg-success/20',
    'text-success',
    'bg-error',
    'bg-error/20',
    'text-error',
    'bg-warning',
    'bg-warning/20',
    'text-warning',
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
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
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