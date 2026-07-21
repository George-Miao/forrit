import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import UnoCSS from 'unocss/vite'

installGlobals()

export default defineConfig({
  optimizeDeps: {
    include: [
      '@base-ui/react/alert-dialog',
      '@base-ui/react/button',
      '@base-ui/react/dialog',
      '@base-ui/react/menu',
      '@base-ui/react/popover',
      '@base-ui/react/toast',
      '@base-ui/react/tooltip',
      '@iconify/react',
      '@remix-run/react',
      'forrit-client',
      'immutable',
      'openapi-fetch',
      'radash',
      'react',
      'react-dom',
      'react-dom/client',
      'react-responsive',
      'react/jsx-dev-runtime',
      'react/jsx-runtime',
      'swr',
      'swr/infinite',
    ],
  },
  resolve: { dedupe: ['react', 'react-dom'] },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:8080',
      },
    },
  },
  plugins: [
    UnoCSS(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_singleFetch: true,
        v3_throwAbortReason: true,
      },
      ssr: false,
    }),
    tsconfigPaths(),
  ],
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
