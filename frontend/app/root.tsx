import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import * as icons from '@douyinfe/semi-icons'
import 'reset-css'
import { Button, Nav, Layout as SemiLayout } from '@douyinfe/semi-ui'

export function Layout({ children }: { children: React.ReactNode }) {
  const { Header, Content } = SemiLayout

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <SemiLayout className='components-layout-demo'>
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
            >
              <Nav.Item
                text='首页'
                itemKey='/'
                link='/'
                icon={<icons.IconHome />}
              />
              <Nav.Item
                text='订阅'
                itemKey='/subscription'
                link='/subscription'
                icon={<icons.IconWifi />}
              />
              <Nav.Item
                text='更新'
                itemKey='/entry'
                link='/entry'
                icon={<icons.IconList />}
              />
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
                  icon={<icons.IconHelpCircle />}
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
              margin: '1em max(3vw, calc(50vw - 800px))',
              minHeight: 'calc(100vh - 64px)',
              maxWidth: '1600px',
            }}
          >
            {children}
          </Content>
          {/* <Footer>Footer</Footer> */}
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
