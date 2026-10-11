/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mc: {
          green: '#10b981',
          'green-dim': '#059669',
          dark: '#09090b',
          darker: '#060608',
          card: '#111113',
          accent: '#10b981',
          highlight: '#f43f5e',
          border: '#1e1e22',
          'border-light': '#27272a',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
