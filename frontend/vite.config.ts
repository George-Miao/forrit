import SemiTheme from '@kousum/vite-plugin-semi-theme'
import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import { defineConfig } from 'vite'
import { cjsInterop } from 'vite-plugin-cjs-interop'
import tsconfigPaths from 'vite-tsconfig-paths'

installGlobals()

export default defineConfig({
  optimizeDeps: { include: ['forrit-client'] },
  plugins: [
    cjsInterop({ dependencies: ['data-fns', 'date-fns-tz'] }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      ssr: false,
    }),
    tsconfigPaths(),
    SemiTheme({ theme: '@semi-bot/semi-theme-forrit' }),
  ],
  ssr: {
    noExternal: [
      '@douyinfe/semi-ui',
      '@douyinfe/semi-foundation',
      '@douyinfe/semi-animation',
      '@douyinfe/semi-animation-styled',
      'scroll-into-view-if-needed',
      '@douyinfe/semi-icons',
      'data-fns',
    ],
  },
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks(id: string) {
  //         // if (id.includes('node_modules')) {
  //         //   return 'vendor'
  //         // }
  //         if (id.includes('forrit')) {
  //           return 'vendor'
  //         }
  //       },
  //     },
  //   },
  // },
})
