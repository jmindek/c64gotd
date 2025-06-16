/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Orbitron', 'sans-serif'],
        mono: ['monospace'],
      },
      colors: {
        'neon-yellow': '#f7f6c5',
        'dark-bg': '#0a0a12',
        'darker-bg': '#050508',
        'c64-blue': '#6C5EB5',
        'c64-dark': '#352879',
        'c64-light': '#B8C6F1',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'neon': '0 0 15px rgba(247, 246, 197, 0.5)',
        'glow': '0 0 10px rgba(247, 246, 197, 0.8)',
      },
      backgroundImage: {
        'blade-runner': "url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=2070&auto=format&fit=crop')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    function({ addBase, theme }) {
      addBase({
        'html': {
          fontFamily: 'Orbitron, sans-serif',
          scrollBehavior: 'smooth',
        },
        'body': {
          color: theme('colors.white'),
          backgroundColor: theme('colors.darker-bg'),
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
