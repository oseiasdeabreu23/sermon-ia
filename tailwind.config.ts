import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores temáticas cristãs
        'primary-blue': '#2563EB',
        'primary-gold': '#D97706',
        'primary-purple': '#9333EA',
        'primary-green': '#059669',
        'dark-bg': '#1a1a1a',
        'light-bg': '#f9fafb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
};
export default config;
