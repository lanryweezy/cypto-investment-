/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './App.tsx',
    './index.tsx'
  ],
  theme: {
    extend: {
      colors: {
        crypto: {
          dark: '#030407',
          card: '#0E1218',
          accent: '#00F0FF',
          secondary: '#7000FF',
          success: '#00FF94',
          danger: '#FF0055',
          text: '#E2E8F0',
          muted: '#64748B'
        }
      }
    },
  },
  plugins: [],
}
