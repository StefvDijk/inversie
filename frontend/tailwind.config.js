/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Inversie brand colors
        primary: {
          DEFAULT: '#d6453a',
          dark: '#d93428',
        },
        accent: '#f76a0c',
        background: '#F4F0E6',
        surface: '#FFFFFF',
        text: {
          primary: '#111111',
          secondary: '#353535',
          muted: '#888888',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '8px 8px 0px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
