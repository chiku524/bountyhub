import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ]
      },
      boxShadow: {
        "custom": '0 0 0.4rem crimson',
        "custom-slate": '0 0 0.4rem #334155',
        "custom-blue": '0 0 0.4rem #3b82f6',
        "custom-green": '0 0 0.4rem #22c55e ',
      },
      dropShadow: {
        "custom": '0 0 0.4rem #fcd34d',
        "custom-green": '0 0 0.4rem #22c55e ',
      },
      animation: {
        "fly": 'fly 4s ease infinite'
      },
      keyframes: {
        fly: {
          '0': { transform: 'translateX(-50px)'},
          '50%': { transform: 'translateX(50px)'},
          '100%': { transform: 'translateX(-50px)'},
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
