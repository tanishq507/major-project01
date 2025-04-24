/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eaebf2',
          100: '#c4c7df',
          200: '#9da3ca',
          300: '#767fb5',
          400: '#5c66a5',
          500: '#1a237e', // Primary
          600: '#1a237e',
          700: '#151b63',
          800: '#10144a',
          900: '#0b0d32',
        },
        secondary: {
          50: '#e1f5fe',
          100: '#b3e5fc',
          200: '#81d4fa',
          300: '#4fc3f7',
          400: '#29b6f6',
          500: '#0d47a1', // Secondary
          600: '#0d47a1',
          700: '#0a3880',
          800: '#082960',
          900: '#051a40',
        },
        accent: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5', // Accent
          500: '#42a5f5',
          600: '#3b95dd',
          700: '#2b74ac',
          800: '#1e577c',
          900: '#103a4f',
        },
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
};