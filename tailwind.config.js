/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // This array tells Tailwind to scan your index.html and all files inside the src folder
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}