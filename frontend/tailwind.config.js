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
        // ===== BEACON WARM EARTH PALETTE =====
        // Sandpaper browns and warm earth tones
        // Creates grounding, natural, calming safety

        primary: {
          // Warm Caramel Brown - Trust, Warmth, Grounding
          // Use for: Primary actions, links, important UI elements
          DEFAULT: '#A67C52',
          light: '#C4A078',
          dark: '#8B5E34',
        },

        secondary: {
          // Soft Sage Green - Growth, Calm, Natural Balance
          // Use for: Secondary actions, helper indicators, positive states
          DEFAULT: '#8B9B7A',
          light: '#A8B599',
          dark: '#6D7D5C',
        },

        alert: {
          // Terracotta Clay - Warm Warning, Earthy Attention
          // Use for: Alerts, warnings, victim indicators (natural clay tone)
          DEFAULT: '#C17A5B',
          light: '#D99B82',
          dark: '#A25C41',
        },

        neutral: {
          // Sandpaper Beige to Deep Brown - Natural, Grounding, Earthy
          // Use for: Backgrounds, text, borders, containers
          50: '#F5F1EB',   // Lightest sand - card backgrounds
          100: '#EBE4D9',  // Very light sand - hover states
          200: '#D9CFC0',  // Light taupe - borders
          300: '#C4B5A3',  // Medium sand - disabled states
          400: '#A69583',  // Warm gray-brown - secondary text
          500: '#8A7866',  // Medium brown - body text
          600: '#6E5F4E',  // Dark brown - headings
          700: '#544639',  // Deep brown - emphasized text
          800: '#3D3128',  // Very dark brown - backgrounds
          900: '#2A2019',  // Darkest espresso - deep backgrounds
        },

        // ===== LEGACY SUPPORT (mapped to new palette) =====
        background: {
          primary: '#2A2019',    // neutral-900 (espresso)
          secondary: '#3D3128',  // neutral-800 (dark brown)
          elevated: '#544639',   // neutral-700 (deep brown)
        },
        glass: {
          bg: 'rgba(61, 49, 40, 0.7)',      // neutral-800 with transparency
          border: 'rgba(196, 181, 163, 0.1)', // neutral-300 with transparency
        },
        accent: {
          blue: '#A67C52',    // primary (caramel)
          green: '#8B9B7A',   // secondary (sage)
          orange: '#C17A5B',  // alert (terracotta)
          red: '#A25C41',     // alert-dark (deep terracotta)
          purple: '#C4A078',  // primary-light (light caramel)
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
