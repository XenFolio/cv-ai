/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'w-1/2',
    'w-1/3',
    'w-2/3',
    'w-full',
    'space-y-0',
    'space-y-1',
    'space-y-2',
    'space-y-3',
    'space-y-4'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        '.heading-gradient': {
          '@apply text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent mb-4': {},
        },
      })
    }),
  ],
};
