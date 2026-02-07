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
        background: '#0a0a0f', // Very dark space black
        surface: '#12121a',    // Slightly lighter for cards
        primary: '#a78bfa',    // Lavender-ish purple (Tailwind violet-400)
        secondary: '#c084fc',  // Purple-400
        accent: '#2dd4bf',     // Teal-400 for contrast
        'lavender-300': '#d8b4fe',
        'lavender-700': '#7e22ce',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
