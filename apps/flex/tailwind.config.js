/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        flex: {
          bg: '#0a0e17',
          surface: '#111827',
          card: '#1a2332',
          border: '#2d3a4f',
          accent: '#22d3ee',
          accent2: '#818cf8',
          success: '#34d399',
          warning: '#fbbf24',
          danger: '#f87171',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(34, 211, 238, 0.35)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
