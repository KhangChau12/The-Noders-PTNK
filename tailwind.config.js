/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Primary Colors
        'primary-blue': '#2563EB',
        'primary-slate': '#475569',
        'accent-blue': '#3B82F6',
        'accent-gray': '#6B7280',
        'accent-cyan': '#06B6D4',
        'accent-green': '#10B981',
        'accent-purple': '#8B5CF6',
        'accent-pink': '#EC4899',
        'accent-orange': '#F97316',

        // Dark Theme — unified with Competition Platform (slate foundation)
        // Legacy token names kept so existing markup needs no rename; only values changed.
        'dark-bg': '#0F172A',
        'dark-surface': '#1E293B',
        'dark-border': '#334155',
        // New aliases matching Competition's token names (use these in new code)
        'bg-primary': '#0F172A',
        'bg-surface': '#1E293B',
        'bg-elevated': '#334155',
        'border-default': '#334155',
        'border-subtle': '#475569',
        'border-focus': '#2563EB',

        'text-primary': '#F8FAFC',
        'text-secondary': '#CBD5E1',
        'text-tertiary': '#94A3B8',
        'text-disabled': '#64748B',

        // Semantic Colors
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#2563EB',

        // Competition Phase Colors (shared design language)
        'phase-registration': '#8B5CF6',
        'phase-public': '#2563EB',
        'phase-private': '#06B6D4',
        'phase-ended': '#64748B',
      },
      fontFamily: {
        primary: ['Nunito', 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Nunito', 'system-ui', 'sans-serif'],
        heading: ['var(--font-shrikhand)', 'system-ui', 'sans-serif'],
        brand: ['var(--font-shrikhand)', 'cursive'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
      },
      boxShadow: {
        'glow-blue-sm': '0 0 10px rgba(37, 99, 235, 0.3)',
        'glow-blue-md': '0 0 20px rgba(37, 99, 235, 0.4)',
        'glow-blue-lg': '0 0 30px rgba(37, 99, 235, 0.5)',
        'glow-cyan-sm': '0 0 10px rgba(6, 182, 212, 0.3)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'levitate': 'levitate 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        levitate: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}