import { Card, Space, Typography } from '@douyinfe/semi-ui'
import {
  format_broadcast,
  get_title,
  parse_broadcast,
  use_is_xs,
} from 'app/util'
import type { Meta, WithId } from 'forrit-client'

import './index.css'

import Poster from '../blurry_image'
import SubscribeButton from './subscription'
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
    <a
      tabIndex={0}
      style={{ width, textDecoration: 'none', cursor: 'pointer', zIndex: 100 }}
      role='button'
      href={`/meta/${meta._id.$oid}`}
    >
      <Poster
        alt='番剧封面'
        width={width}
        height={height}
        poster_path={meta.tv.poster_path as string}
      />
    </a>
  ) : null
  const interval = meta.broadcast ? parse_broadcast(meta.broadcast) : {}

  return (
    <Card
      shadows='always'
      bordered={false}
      cover={cover}
      style={{
        width,
        cursor: 'unset',
      }}
      bodyStyle={{
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        padding: '15px',
      }}
    >
      <Card.Meta
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={<Text ellipsis={{ showTooltip: true }}>{get_title(meta)}</Text>}
        description={
          <Space>
            <Text type='secondary'>{format_broadcast(interval)}</Text>
            {/* <Loading spin={false} size='small' useData={useNumEntries}>
                {num => <Text type='secondary'>{num} 个资源</Text>}
              </Loading> */}
          </Space>
        }
      />

      <SubscribeButton
        show_text={false}
        meta_id={meta._id.$oid}
        subscription={meta.subscription ?? null}
      />
    </Card>
  )
}
