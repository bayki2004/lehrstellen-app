import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00C2FF',
          light: '#66D9FF',
          dark: '#0094C6',
          deeper: '#006E94',
        },
        secondary: {
          DEFAULT: '#00E5FF',
          light: '#66EFFF',
          dark: '#00A3B8',
        },
        accent: '#B026FF',
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        surface: '#FFFFFF',
        background: '#F5F6FA',
        'background-secondary': '#EBEDF3',
        border: {
          DEFAULT: '#D4D7E1',
          light: '#E8EAF0',
        },
        text: {
          DEFAULT: '#111827',
          secondary: '#4B5563',
          tertiary: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'elevated': '0 8px 24px -4px rgba(0,0,0,0.08), 0 4px 8px -2px rgba(0,0,0,0.04)',
        'sidebar': '1px 0 12px 0 rgba(0,0,0,0.04)',
      },
      borderRadius: {
        '2xl': '14px',
        '3xl': '18px',
      },
    },
  },
  plugins: [],
};

export default config;
