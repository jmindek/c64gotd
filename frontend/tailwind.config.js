/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.ts',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Orbitron', 'sans-serif'],
        mono: ['monospace'],
      },
      colors: {
        primary: '#f7d51d',
        'primary-dark': '#f2c409',
        bg: '#1a1a1a',
        text: '#ffffff',
        'text-secondary': '#a0a0a0',
        border: '#333333',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'neon': '0 0 15px rgba(247, 213, 29, 0.5)',
      },
    },
  },
  plugins: [
    function({ addBase, theme }) {
      addBase({
        'html': {
          fontFamily: 'Orbitron, sans-serif',
          scrollBehavior: 'smooth',
        },
        'body': {
          color: theme('colors.text'),
          backgroundColor: theme('colors.bg'),
          minHeight: '100vh',
        },
        'h1, h2, h3, h4, h5, h6': {
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        },
      })
    },
  ],
}
