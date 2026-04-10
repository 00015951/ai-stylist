/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        slate: {
          850: '#172033',
          950: '#0c1222',
        },
      },
    },
  },
  plugins: [],
}
