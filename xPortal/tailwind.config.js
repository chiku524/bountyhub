/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cursive': ['Dancing Script', 'cursive'],
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(100vh)' },
          '100%': { transform: 'translateY(-100vh)' }
        }
      },
      animation: {
        'float': 'float 5s linear infinite',
      },
      colors: {
        'custom-green': '#4ade80',
      },
      boxShadow: {
        'custom-green': '0 0 15px rgba(74, 222, 128, 0.5)',
      }
    },
  },
  plugins: [],
};
 