/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#05050f',
          secondary: '#0a0a1e',
          card: '#12122a',
          elevated: '#18183a',
        },
        accent: {
          purple: '#6c63ff',
          cyan: '#00d4ff',
          green: '#00ff88',
          red: '#ff4455',
          yellow: '#ffaa00',
          pink: '#ff63a5',
        },
        border: {
          DEFAULT: '#1e1e4a',
          glow: 'rgba(108, 99, 255, 0.4)',
        },
        text: {
          primary: '#e8e8ff',
          muted: '#6668aa',
          dim: '#3a3a7a',
        }
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(108, 99, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108, 99, 255, 0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(108, 99, 255, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(108, 99, 255, 0.7), 0 0 50px rgba(0, 212, 255, 0.2)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
