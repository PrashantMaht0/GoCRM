/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crm-darkest': '#2d2a24',
        'crm-dark': '#4a453a',
        'crm-brown': '#676050',
        'crm-light': '#eaf8d8',
        'crm-accent': '#d3f0ad',
        'crm-white': '#ffffff',
      }
    },
  },
  plugins: [],
}