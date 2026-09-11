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
          bg: '#0b0f19',
          surface: '#111827',
          card: '#1f2937',
          cardHover: '#374151',
          border: '#374151',
          cyan: '#06b6d4',
          neonCyan: '#22d3ee',
          gold: '#f59e0b',
          neonGold: '#fbbf24',
          emerald: '#10b981',
          neonEmerald: '#34d399',
          danger: '#ef4444',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 10px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 35px rgba(6, 182, 212, 0.8), inset 0 0 20px rgba(6, 182, 212, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
