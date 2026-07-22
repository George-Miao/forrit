import { Link } from '@remix-run/react'
import WidthLimit from './width_limit'

export interface PageRoute {
  href?: string
  name: string
}

export interface PageHeaderProps {
  routes?: PageRoute[]
  children: React.ReactNode
}

export default function PageHeader({ children, routes }: PageHeaderProps) {
  return (
    <header
      className="border-b border-edge bg-surface pb-8 pt-4 shadow-[0_1px_2px_rgb(0_0_0/10%)]"
      data-page-header
    >
      <WidthLimit>
        <div className="flex min-h-44 flex-col items-start">
          {routes?.length ? (
            <nav aria-label="面包屑">
              <ol className="m-0 flex list-none flex-wrap gap-2 p-0 text-sm text-muted">
                {routes.map((route, index) => (
                  <li className="flex items-center gap-2" key={route.name}>
                    {index ? <span aria-hidden="true">/</span> : null}
                    {route.href ? (
                      <Link className="hover:text-text" to={route.href}>
                        {route.name}
                      </Link>
                    ) : (
                      <span aria-current="page" className="font-600 text-text">
                        {route.name}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <div className="flex w-full flex-1 items-end pt-6">{children}</div>
        </div>
      </WidthLimit>
    </header>
  )
}
