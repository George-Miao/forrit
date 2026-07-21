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
    <div className="border-b border-edge bg-surface py-4 shadow-[0_1px_2px_rgb(0_0_0/10%)]">
      <WidthLimit>
        <div className="flex flex-col items-start gap-6">
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
          {children}
        </div>
      </WidthLimit>
    </div>
  )
}
