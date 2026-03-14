/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f7ff',
          100: '#eaecff',
          500: '#5b63ff',
          700: '#3d43cf'
        },
        luxe: {
          100: '#faf3df',
          300: '#efd9a7',
          500: '#d2a94c'
        }
      },
      boxShadow: {
        glow: '0 8px 30px rgba(91, 99, 255, 0.22)'
      }
    }
  },
  plugins: []
};
