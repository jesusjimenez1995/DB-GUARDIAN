/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dbBlue: '#0018A8',
        dbBlueDark: '#00126E',
        dbBlueLight: '#2443B3',
        slateBody: '#1F2937',
        appBg: '#F5F7FA',
        dbLine: '#D9DEE8'
      },
      boxShadow: {
        card: '0 14px 42px -24px rgba(15, 23, 42, 0.34)'
      },
      borderRadius: {
        card: '16px'
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: [typography]
};
