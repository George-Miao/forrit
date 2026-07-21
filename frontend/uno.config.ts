import { defineConfig, presetWind3, transformerVariantGroup } from 'unocss'

export default defineConfig({
  blocklist: ['?'],
  presets: [presetWind3()],
  shortcuts: {
    'ui-button':
      'inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-500 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100',
    'ui-focus':
      'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    'ui-icon-button':
      'ui-button ui-focus h-9 w-9 border-0 bg-transparent p-0 text-muted hover:bg-[rgb(28_31_35/8%)] hover:text-text',
    'ui-panel': 'rounded-md border border-edge bg-surface shadow-[var(--shadow-card)]',
    'ui-popup':
      'rounded-lg border-[0.5px] border-[rgb(28_31_35/20%)] bg-surface p-2 text-sm shadow-[0_14px_36px_rgb(28_31_35/18%),0_3px_10px_rgb(28_31_35/10%)] outline-none',
  },
  theme: {
    colors: {
      accent: 'var(--color-accent)',
      'accent-soft': 'var(--color-accent-soft)',
      background: 'var(--color-background)',
      danger: 'var(--color-danger)',
      edge: 'var(--color-edge)',
      muted: 'var(--color-text-muted)',
      surface: 'var(--color-surface)',
      text: 'var(--color-text)',
    },
  },
  transformers: [transformerVariantGroup()],
})
