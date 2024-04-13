import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { cjsInterop } from 'vite-plugin-cjs-interop'

installGlobals()

export default defineConfig({
  plugins: [
    cjsInterop({
      dependencies: ['date-fns-tz'],
    }),
    remix(),
    tsconfigPaths(),
  ],
  build: {
    cssCodeSplit: false,
  },
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
