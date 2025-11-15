/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0a0a0a',
          secondary: '#171717',
          elevated: '#1f1f1f',
        },
        glass: {
          bg: 'rgba(23, 23, 23, 0.7)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        accent: {
          blue: '#3b82f6',
          green: '#10b981',
          orange: '#f59e0b',
          red: '#ef4444',
          purple: '#a855f7',
        },
      },
      backdropBlur: {
        glass: '24px',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
