/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: ['bg-yellow-50'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        aovel: ['AovelNeo', 'ui-sans-serif', 'system-ui'],
        greycliff: ['Greycliff', 'ui-sans-serif', 'system-ui'],
        visby: ['VisbyRound', 'ui-sans-serif', 'system-ui'],
        cerulya: ['Cerulya', 'ui-sans-serif', 'system-ui'],
        mielle: ['Mielle', 'ui-sans-serif', 'system-ui'],
        quincy: ['Quincy', 'ui-sans-serif', 'system-ui'],
        argent: ['Argent', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
