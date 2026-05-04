/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dbBlue: '#0018A8',
        slateBody: '#1E293B',
        appBg: '#F8FAFC'
      },
      boxShadow: {
        card: '0 14px 42px -24px rgba(15, 23, 42, 0.34)'
      },
      borderRadius: {
        card: '16px'
      },
      fontFamily: {
        sans: ['Source Sans 3', 'sans-serif']
      }
    }
  },
  plugins: [typography]
};
