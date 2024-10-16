import * as icons from '@douyinfe/semi-icons'
import {
  Button,
  Nav,
  Layout as SemiLayout,
  Typography,
} from '@douyinfe/semi-ui'
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
import 'reset-css'
import WidthLimit from './components/width_limit'

const { Header, Content, Footer } = SemiLayout
const { Text, Paragraph } = Typography

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <SemiLayout
          style={{
            backgroundColor: 'var(--semi-color-fill-0)',
          }}
        >
          <Header>
            <Nav
              mode='horizontal'
              renderWrapper={({ itemElement, props }) => {
                const p = props as { itemKey: string }
                return (
                  <NavLink to={p.itemKey} style={{ textDecoration: 'none' }}>
                    {itemElement}
                  </NavLink>
                )
              }}
              items={[
                { itemKey: '/', icon: <icons.IconHome /> },
                {
                  itemKey: '/entry',
                  icon: <icons.IconActivity />,
                },
                {
                  itemKey: '/subscription',
                  icon: <icons.IconFavoriteList />,
                },
                {
                  itemKey: '/download',
                  icon: <icons.IconDownload />,
                },
              ]}
            >
              <Nav.Footer>
                <Button
                  theme='borderless'
                  icon={<icons.IconBell />}
                  style={{
                    color: 'var(--semi-color-text-2)',
                    marginRight: '12px',
                  }}
                />
                <Button
                  theme='borderless'
                  icon={<icons.IconGithubLogo />}
                  style={{
                    color: 'var(--semi-color-text-2)',
                    marginRight: '12px',
                  }}
                />
              </Nav.Footer>
            </Nav>
          </Header>
          <Content
            style={{
              minHeight: 'calc(100svh - 204px)',
            }}
          >
            {children}
          </Content>
          <Footer
            style={{
              padding: '2em 0',
              marginTop: '1em',
            }}
          >
            <WidthLimit>
              <Paragraph
                type='tertiary'
                style={{
                  textAlign: 'center',
                }}
              >
                Project Forrit © {new Date().getFullYear()} <br />
                By{' '}
                <Text link={{ href: 'https://github.com/George-Miao' }}>
                  Pop
                </Text>
                <br />
                Built with{' '}
                <Text link={{ href: 'https://remix.run' }}>Remix</Text> and{' '}
                <Text link={{ href: 'https://semi.design' }}>Semi UI</Text>
              </Paragraph>
            </WidthLimit>
          </Footer>
        </SemiLayout>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
