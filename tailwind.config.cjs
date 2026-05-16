/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          page: 'var(--surface-page)',
          card: 'var(--surface-card)',
          sunken: 'var(--surface-sunken)',
          overlay: 'var(--surface-overlay)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        accent: {
          bud: 'var(--accent-bud)',
          'bud-soft': 'var(--accent-bud-soft)',
          'bud-strong': 'var(--accent-bud-strong)',
          zpm: 'var(--accent-zpm)',
          'zpm-soft': 'var(--accent-zpm-soft)',
          'zpm-strong': 'var(--accent-zpm-strong)',
        },
        fg: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          disabled: 'var(--text-disabled)',
          'on-accent': 'var(--text-on-accent)',
        },
        status: {
          success: 'var(--color-success)',
          'success-bg': 'var(--color-success-bg)',
          warning: 'var(--color-warning)',
          'warning-bg': 'var(--color-warning-bg)',
          danger: 'var(--color-danger)',
          'danger-bg': 'var(--color-danger-bg)',
          info: 'var(--color-info)',
          'info-bg': 'var(--color-info-bg)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'IBM Plex Sans Thai Looped', 'Sarabun', 'sans-serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-sm)',
        'card-hover': 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        focus: 'var(--shadow-focus)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      fontSize: {
        display: ['var(--text-display)', { lineHeight: '1.15', fontWeight: '700' }],
        metric: ['var(--text-metric)', { lineHeight: '1.2', fontWeight: '700' }],
        h1: ['var(--text-h1)', { lineHeight: '1.25', fontWeight: '650' }],
        h2: ['var(--text-h2)', { lineHeight: '1.35', fontWeight: '600' }],
        h3: ['var(--text-h3)', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['var(--text-body)', { lineHeight: '1.55' }],
        small: ['var(--text-small)', { lineHeight: '1.5' }],
        caption: ['var(--text-caption)', { lineHeight: '1.4' }],
        kicker: ['var(--text-kicker)', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600' }],
        mono: ['var(--text-mono)', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
}
