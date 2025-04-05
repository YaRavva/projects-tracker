/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'crypto-black': '#0A0E17',
        'crypto-dark': '#111827',
        'crypto-green': {
          50: '#E6F7EF',
          100: '#C2ECD8',
          200: '#9EE0C1',
          300: '#4ade80',
          400: '#22c55e',
          500: '#00f5a0',
          600: '#00d98e',
          700: '#00b377',
          800: '#144B32',
          900: '#0A2619',
        },
        'glass-bg': 'rgba(20, 20, 20, 0.6)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      backgroundImage: {
        'crypto-gradient': 'radial-gradient(circle at 10% 20%, rgba(0, 245, 160, 0.1) 0%, rgba(10, 14, 23, 0) 80%)',
        'grid-pattern': 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23333333\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 15px rgba(0, 245, 160, 0.3)',
      },
    },
  },
  plugins: [],
} 