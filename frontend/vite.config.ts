import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { cjsInterop } from 'vite-plugin-cjs-interop'
import SemiTheme from '@kousum/vite-plugin-semi-theme'

installGlobals()

export default defineConfig({
  plugins: [
    cjsInterop({
      dependencies: ['date-fns-tz'],
    }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    SemiTheme({
      theme: '@semi-bot/semi-theme-forrit',
    }),
  ],
  ssr: {
    noExternal: [
      '@douyinfe/semi-ui',
      '@douyinfe/semi-foundation',
      '@douyinfe/semi-animation',
      '@douyinfe/semi-animation-styled',
      'scroll-into-view-if-needed',
      '@douyinfe/semi-icons',
    ],
  },
})
