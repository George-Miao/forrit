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
        padding: '1em 0',
        backgroundColor: '#FFF',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
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
