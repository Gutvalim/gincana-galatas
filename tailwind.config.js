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
        ump: {
          blue: '#003366',       // Deep Navy UMP
          royal: '#004b93',      // Royal Blue UMP
          red: '#c8102e',        // UMP Red
          redDark: '#991b1b',
          accent: '#ef4444',
          gold: '#f59e0b',
        },
        game: {
          bg: '#f8fafc',          // Light slate background
          surface: '#ffffff',     // Pure white surface
          card: '#ffffff',        // White card
          cardHover: '#f1f5f9',   // Light card hover
          border: '#e2e8f0',      // Crisp light border
          umpBlue: '#003366',     // UMP Navy
          umpRoyal: '#004b93',    // UMP Royal
          umpRed: '#c8102e',      // UMP Red
          cyan: '#0284c7',        // Blue highlight
          neonCyan: '#38bdf8',
          gold: '#f59e0b',        // Gold
          neonGold: '#fbbf24',
          emerald: '#16a34a',     // Green
          neonEmerald: '#22c55e',
          danger: '#dc2626',      // Red
          neonDanger: '#ef4444',
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
