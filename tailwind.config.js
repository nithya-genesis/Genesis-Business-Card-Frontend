/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: '#E8E4D8',
        input: '#E8E4D8',
        ring: '#D4A72C',
        background: '#FFFFFF',
        foreground: '#171717',
        genesis: {
          50: '#FDFBF7',
          100: '#FBF6E9',
          200: '#F5E8C7',
          300: '#ECD494',
          400: '#E2BF61',
          500: '#D4A72C', // Primary Genesis Gold
          600: '#B5891E',
          700: '#906A17',
          800: '#6E5016',
          900: '#4D360F',
          dark: '#171717',
          muted: '#525252',
          surface: '#FFFFFF',
          subtle: '#FAFAF7',
          border: '#E8E4D8',
        },
        primary: {
          DEFAULT: '#D4A72C',
          foreground: '#FFFFFF',
          50: '#FDFBF7',
          100: '#FBF6E9',
          200: '#F5E8C7',
          300: '#ECD494',
          400: '#E2BF61',
          500: '#D4A72C',
          600: '#B5891E',
          700: '#906A17',
          800: '#6E5016',
          900: '#4D360F',
        },
        secondary: {
          DEFAULT: '#FAFAF7',
          foreground: '#171717',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F4F4F0',
          foreground: '#525252',
        },
        accent: {
          DEFAULT: '#FBF6E9',
          foreground: '#906A17',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#171717',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 1px 3px rgba(212, 167, 44, 0.15)',
        'gold-md': '0 4px 14px rgba(212, 167, 44, 0.20)',
        'gold-lg': '0 10px 25px rgba(212, 167, 44, 0.25)',
        'card-subtle': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(212, 167, 44, 0.12)',
      },
    },
  },
  plugins: [],
}
