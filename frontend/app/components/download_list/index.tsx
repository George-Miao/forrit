import { List, Space, Tooltip } from '@douyinfe/semi-ui'
import Text from '@douyinfe/semi-ui/lib/es/typography/text'
import { format_time_relative, get_date_from_id } from 'app/util'
import type { Job, WithId, DownloadState } from 'forrit-client'

export interface DownloadListProps {
  data: WithId<Job>[]
}

const stateMap: Record<DownloadState, string> = {
  'cancelled': '已取消',
  'finished': '完成',
  'pending': '等待中',
  'downloading': '下载中',
  'failed': '失败',
}

export default function DownloadItem({ item }: { item: WithId<Job> }) {
  const added = get_date_from_id(item._id.$oid)
  const added_formatted = format_time_relative(added)
  const state_type =
    item.state === 'failed'
      ? 'danger'
      : item.state === 'finished'
        ? 'success'
        : 'tertiary'
  return (
    <List.Item
      style={{ padding: '16px 0', width: '100%' }}
      extra={item.state === 'pending'}
    >
      <Space vertical align='start' spacing={4} style={{ width: '100%' }}>
        <Text
          link={{ href: `/entry/${item.entry_id.$oid}` }}
          style={{
            wordWrap: 'break-word',
            wordBreak: 'break-all',
            letterSpacing: '-0.3px',
            cursor: 'pointer',
            fontWeight: 400,
          }}
        >
          {item.name}
        </Text>
        <Space>
          <Text type={state_type} size='small'>
            {stateMap[item.state]}
          </Text>
          <Text type='tertiary' size='small'>
            <Tooltip content={added.toLocaleString()} trigger='click'>
              {added_formatted}
            </Tooltip>
          </Text>
        </Space>
      </Space>
    </List.Item>
  )
}
