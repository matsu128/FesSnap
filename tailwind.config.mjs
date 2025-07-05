/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'gradient-move': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(12px)' },
        },
      },
      animation: {
        'gradient-move': 'gradient-move 3s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 1.8s infinite cubic-bezier(0.4,0,0.6,1)',
      },
    },
  },
  plugins: [],
} 