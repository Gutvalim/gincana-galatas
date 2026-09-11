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
        game: {
          bg: '#06140e',          // Deep IPB forest green dark
          surface: '#0c231a',     // IPB surface green
          card: '#133829',        // IPB card green
          cardHover: '#1c4a37',   // IPB card hover
          border: '#1d5740',      // IPB border
          ipbGreen: '#006341',    // IPB Official Green
          ipbLight: '#00875a',    // IPB Bright Green
          cyan: '#10b981',        // Replaced with IPB vibrant emerald
          neonCyan: '#34d399',    // Vibrant emerald highlight
          gold: '#f59e0b',        // Presbyterian Gold
          neonGold: '#fbbf24',    // Bright gold highlight
          emerald: '#10b981',     // Green highlight
          neonEmerald: '#34d399',
          danger: '#ef4444',      // Red warning
          neonDanger: '#f87171',
        },
        team: {
          ucp: '#0284c7', // Sky Blue
          upa: '#ea580c', // Orange
          ump: '#16a34a', // Green
          casais: '#9333ea', // Purple
          adultos: '#ca8a04', // Gold
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 0.75s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 135, 90, 0.4), inset 0 0 10px rgba(0, 135, 90, 0.2)' },
          '50%': { boxShadow: '0 0 35px rgba(0, 135, 90, 0.8), inset 0 0 20px rgba(0, 135, 90, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
