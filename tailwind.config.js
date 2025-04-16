/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-dark': '#1a1b1e',
        'app-darker': '#141517',
        'app-light': '#2c2e33',
        'app-hover': '#373a40',
      },
    },
  },
  plugins: [],
}