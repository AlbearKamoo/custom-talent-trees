/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        talent: {
          locked: '#4a4a4a',
          unlocked: '#8b5a2b',
          selected: '#ffd700',
          available: '#00ff00',
          unavailable: '#ff4444',
          background: '#1a1a1a',
          border: '#333333',
          connection: '#666666',
          connectionActive: '#ffd700',
        }
      },
      boxShadow: {
        'talent': '0 0 10px rgba(255, 215, 0, 0.5)',
        'talent-hover': '0 0 15px rgba(255, 215, 0, 0.8)',
      }
    },
  },
  plugins: [],
} 