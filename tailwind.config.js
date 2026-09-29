/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#f97316',
          600: '#d96b27',
          700: '#c25a1d',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Monochromatic Minimalism Dark Mode Palette
        dark: {
          bg: '#121212',
          card: '#1E1E1E',
          input: '#2A2A2A',
          hover: '#333333',
          border: '#444444',
          muted: '#888888',
          secondary: '#B0B0B0',
          text: '#E0E0E0',
        },
      },
      borderColor: {
        dark: '#444444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
