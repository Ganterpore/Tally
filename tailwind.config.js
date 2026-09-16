/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
      },
      keyframes: {
        flipDown: {
          '0%': { transform: 'rotateX(0deg)', opacity: '1' },
          '100%': { transform: 'rotateX(-100deg)', opacity: '0' },
        },
      },
      animation: {
        'flip-down': 'flipDown 260ms ease-in forwards',
      },
    },
  },
  plugins: [],
};
