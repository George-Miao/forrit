import { Breadcrumb, Space } from '@douyinfe/semi-ui'
import WidthLimit from './width_limit'
import type { RouteProps } from '@douyinfe/semi-ui/lib/es/breadcrumb'

export interface PageHeaderProps {
  routes?: Array<RouteProps>
  children: React.ReactNode
}
export default function PageHeader({ children, routes }: PageHeaderProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--semi-color-fill-0)',
        padding: '1em 0',
      }}
    >
      <WidthLimit>
        <Space vertical align='start' spacing='loose'>
          <Breadcrumb showTooltip={{ width: 114514 }} routes={routes} />
          {children}
        </Space>
      </WidthLimit>
    </div>
  )
}
