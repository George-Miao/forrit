import { Card, Space, Typography } from '@douyinfe/semi-ui'
import {
  get_title,
  format_broadcast,
  parse_broadcast,
  use_is_xs,
} from '../../util'
import type { Meta, WithId } from 'forrit-client'

import './index.css'
import hooks, { map } from 'app/client'
import Loading from '../loading'

const xs_width = '47dvw - 8px'

export default function MetaCard({ meta }: { meta: WithId<Meta> }) {
  const { Text } = Typography
  const is_xs = use_is_xs()
  const [width, height] = is_xs
    ? [`calc(${xs_width})`, `calc(1.5 * (${xs_width}))`]
    : [230, 230 * 1.5]
  // const useNumEntries = () => {
  //   return map(hooks.useMetaEntries(meta._id.$oid), x => x.length)
  // }

  const cover = meta.tv?.poster_path ? (
    <img
      alt='backdrop'
      style={{
        width,
        height,
      }}
      src={`https://image.tmdb.org/t/p/original/${meta.tv.poster_path}`}
    />
  ) : null
  const interval = meta.broadcast ? parse_broadcast(meta.broadcast) : {}

  return (
    <a
      tabIndex={0}
      style={{ width, textDecoration: 'none', cursor: 'pointer', zIndex: 100 }}
      role='button'
      href={`/meta/${meta._id.$oid}`}
    >
      <Card
        shadows='hover'
        bodyStyle={{
          maxWidth: '100%',
        }}
        cover={cover}
        footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
      >
        <Card.Meta
          title={
            <Text ellipsis={{ showTooltip: true }}>{get_title(meta)}</Text>
          }
          description={
            <Space>
              <Text type='secondary'>{format_broadcast(interval)}</Text>
              {/* <Loading spin={false} size='small' useData={useNumEntries}>
                {num => <Text type='secondary'>{num} 个资源</Text>}
              </Loading> */}
            </Space>
          }
        />
      </Card>
    </a>
  )
}
