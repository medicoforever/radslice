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
        dicom: {
          950: '#06090e',
          900: '#0b1017',
          800: '#141c27',
          700: '#1f2b3b',
          600: '#2c3b50',
          500: '#3d506a',
          accent: '#00e5ff',
          medical: '#0070f3',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
