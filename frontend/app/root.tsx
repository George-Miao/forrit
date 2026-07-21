import { Tooltip } from '@base-ui/react/tooltip'
import '@fontsource/geist-sans'
import '@fontsource/geist-sans/300.css'
import '@fontsource/geist-sans/400.css'
import '@fontsource/geist-sans/500.css'
import '@fontsource/geist-sans/600.css'
import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import 'virtual:uno.css'
import './styles.css'
import WidthLimit from './components/width_limit'
import Icon, { type IconName } from './ui/icon'
import ToastRegion from './ui/toast'

const navigation: Array<{ href: string; icon: IconName; label: string }> = [
  { href: '/', icon: 'home', label: '首页' },
  { href: '/entry', icon: 'activity', label: '更新' },
  { href: '/subscription', icon: 'heart', label: '订阅' },
  { href: '/download', icon: 'download', label: '下载' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Tooltip.Provider>
          <ToastRegion>
            <header className="border-b border-edge bg-surface">
              <nav
                aria-label="主要导航"
                className="flex min-h-15 items-center gap-8 px-4 sm:px-16"
              >
                  {navigation.map((item) => (
                    <NavLink
                      aria-label={item.label}
                      className={({ isActive }) =>
                        `ui-focus flex h-10 w-10 items-center justify-center rounded-md text-xl no-underline transition hover:-translate-y-px hover:bg-[rgb(28_31_35/8%)] active:scale-95 ${
                          isActive
                            ? 'text-text'
                            : 'text-muted hover:bg-background hover:text-text'
                        }`
                      }
                      key={item.href}
                      to={item.href}
                    >
                      <Icon name={item.icon} />
                    </NavLink>
                  ))}
                  <span className="flex-1" />
                  <button
                    aria-label="通知"
                    className="ui-icon-button text-xl"
                    type="button"
                  >
                    <Icon className="text-lg" name="bell" />
                  </button>
                  <a
                    aria-label="GitHub"
                    className="ui-icon-button text-xl"
                    href="https://github.com/George-Miao/forrit"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Icon className="text-lg" name="github" />
                  </a>
              </nav>
            </header>
            <main className="min-h-[calc(100svh-204px)]">{children}</main>
            <footer className="mt-4 py-8 text-center text-sm text-muted">
              <WidthLimit>
                <p className="m-0 leading-6">
                  Project Forrit © {new Date().getFullYear()}
                  <br />
                  By <a href="https://github.com/George-Miao">Pop</a>
                  <br />
                  Built with <a href="https://remix.run">Remix</a>,{' '}
                  <a href="https://base-ui.com">Base UI</a>, and UnoCSS
                </p>
              </WidthLimit>
            </footer>
          </ToastRegion>
        </Tooltip.Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
