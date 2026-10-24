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
          selected: '#fed600',
          available: '#23fd24',
          unavailable: '#ff4444',
          background: '#1a1a1a',
          border: '#333333',
          connection: '#666666',
          connectionActive: '#fed600',
        }
      },
      boxShadow: {
        'talent': '0 0 10px rgba(254, 214, 0, 0.5)',
        'talent-hover': '0 0 15px rgba(254, 214, 0, 0.8)',
      }
    },
  },
  plugins: [],
} 