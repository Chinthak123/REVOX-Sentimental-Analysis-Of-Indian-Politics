/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020817',
          900: '#040e28',
          800: '#071428',
          700: '#0d1f3c',
          600: '#122548',
          500: '#1a3055',
          400: '#243d66',
        },
      },
      boxShadow: {
        'glow-blue':   '0 0 20px rgba(79,142,247,0.20)',
        'glow-blue-lg':'0 0 35px rgba(79,142,247,0.30)',
        'glow-pink':   '0 0 20px rgba(244,114,182,0.20)',
        'glow-green':  '0 0 20px rgba(52,211,153,0.20)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px) scale(0.97)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
      },
    },
  },
  plugins: [],
}
