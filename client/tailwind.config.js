module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          400: '#00ffff',
          300: '#00cccc',
        },
        purple: {
          500: '#8b5cf6',
        },
      },
      boxShadow: {
        neon: '0 0 5px theme("colors.cyan.400"), 0 0 20px theme("colors.cyan.400")',
      },
      textShadow: {
        neon: '0 0 5px theme("colors.cyan.400"), 0 0 10px theme("colors.cyan.400"), 0 0 15px theme("colors.cyan.400"), 0 0 20px theme("colors.cyan.400")',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-neon': {
          textShadow: '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}