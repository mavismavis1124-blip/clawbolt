import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-void': '#040404',
        'bg-soft': '#0A0A0A',
        'surface': '#101010',
        'surface-hover': '#1A1A1A',
        'surface-elevated': '#101010',
        'border-subtle': '#242424',
        'line': '#242424',
        'accent': '#FF1E2D',
        'accent-crimson': '#FF1E2D',
        'accent-2': '#FF4453',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A1A1AA',
        'text-tertiary': '#71717A',
        'muted': '#A1A1AA',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config