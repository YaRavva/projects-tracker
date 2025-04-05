/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cryptix-dark': '#040a0f',
        'cryptix-darker': '#020507',
        'cryptix-green': '#00ff9d',
        'cryptix-green-dark': '#00cc7d',
        'cryptix-green-light': '#7dffcb',
        'cryptix-blue': '#0a192f',
        'cryptix-gray': '#8892b0',
        'glass-bg': 'rgba(4, 10, 15, 0.3)',
        'glass-border': 'rgba(0, 255, 157, 0.1)',
        'glass-highlight': 'rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'crypto-gradient': 'radial-gradient(circle at 10% 20%, rgba(0, 255, 157, 0.1) 0%, rgba(4, 10, 15, 0) 80%)',
        'grid-pattern': 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2300ff9d\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        'dark-gradient': 'linear-gradient(to bottom, rgba(4, 10, 15, 0.8), rgba(2, 5, 7, 1))',
        'card-gradient': 'linear-gradient(135deg, rgba(4, 10, 15, 0.6) 0%, rgba(2, 5, 7, 0.8) 100%)',
        'glow-dots': 'radial-gradient(circle, rgba(0, 255, 157, 0.15) 1px, transparent 1px)',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 255, 157, 0.1)',
        'glass-strong': '0 8px 32px rgba(0, 255, 157, 0.15)',
        'glass-inner': 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        'glow': '0 0 20px rgba(0, 255, 157, 0.2)',
        'glow-sm': '0 0 10px rgba(0, 255, 157, 0.15)',
        'glow-lg': '0 0 30px rgba(0, 255, 157, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.7 },
          '50%': { opacity: 1 },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}