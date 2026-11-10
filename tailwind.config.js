/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        minecraft: ['"Press Start 2P"', 'monospace'],
        body: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      colors: {
        mc: {
          dark: '#141416',
          panel: 'rgba(20, 20, 22, 0.78)',
          border: 'rgba(255, 255, 255, 0.14)',
          btn: '#727272',
          btnLight: '#8C8C8C',
          btnDark: '#383838',
          xp: '#70E000',
          village: '#55FF55',
          cherry: '#FFAACC',
          stronghold: '#B388FF',
          mineshaft: '#FFAA00',
          snowy: '#70C5FF',
          deepdark: '#00E5FF',
          end: '#D670D6',
        }
      }
    },
  },
  plugins: [],
}
