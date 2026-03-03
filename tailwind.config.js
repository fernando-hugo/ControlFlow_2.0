/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        anubis: {
          bg: '#0b0f1a',     // Fundo escuro do vídeo
          card: '#161b2c',   // Cor dos cards
          text: '#ffffff',
          accent: '#2563eb'  // Azul principal
        }
      }
    },
  },
  plugins: [],
}