import { Card, Space, Tooltip, Typography } from '@douyinfe/semi-ui'
import { use_is_xs, type ExtractedMeta } from 'app/util'
import SubscribeButton from './meta_card/subscription'
import type { CSSProperties } from 'react'

export const width = '(min(max(100dvw * 0.3, 150px), 300px))'
export const header_height = `calc(60px + 2em + ${width} * 1.5)`

const { Text, Title } = Typography

export default function MetaDetailHeader({
  meta,
  vertical,
  style,
}: { meta: ExtractedMeta; vertical?: boolean; style?: CSSProperties }) {
  vertical = vertical ?? false
  const is_xs = use_is_xs()

  const cover = meta.poster ? (
    <img
      alt='backdrop'
      style={
        vertical
          ? undefined
          : {
              width: `calc(${width})`,
              height: `calc(${width} * 1.5)`,
              borderRadius: 'var(--semi-border-radius-medium)',
            }
      }
      src={meta.poster}
    />
  ) : undefined
  const detail_text = (
    <MetaDetailText
      meta={meta}
      style={{
        minHeight: vertical ? undefined : `calc(${width} * 1.5)`,
      }}
    />
  )

  return vertical ? (
    <Card shadows='always' cover={cover} style={style}>
      {detail_text}
    </Card>
  ) : (
    <Space
      align='start'
      spacing={is_xs ? 'medium' : 'loose'}
      style={style}
      vertical={vertical}
    >
      {cover}
      {detail_text}
    </Space>
  )
}

function MetaDetailText({
  meta,
  style,
}: { meta: ExtractedMeta; style: CSSProperties }) {
  const { title, year, info, overview, tv } = meta

  return (
    <Space vertical align='start' style={style}>
      <Title
        heading={3}
        style={{
          verticalAlign: 'baseline',
        }}
      >
        <Tooltip content={tv?.original_name as string | undefined}>
          <span>{title}</span>
        </Tooltip>
        {year ? (
          <Title
            heading={4}
            type='tertiary'
            weight='light'
            component='span'
            style={{
              marginLeft: '0.2em',
            }}
          >
            ({year})
          </Title>
        ) : null}
      </Title>
      <Text type='tertiary'>
        {info.map((x, i, arr) => (
          <>
            {x.tooltip ? (
              <Tooltip content={x.tooltip} key={x.content}>
                <span>{x.content}</span>
              </Tooltip>
            ) : (
              <span key={x.content}>{x.content}</span>
            )}

            {i < arr.length - 1 ? (
              <span key={x.content} style={{ margin: '0 .3em' }}>
                ·
              </span>
            ) : null}
          </>
        ))}
      </Text>

      {overview ? (
        <Text
          type='secondary'
          ellipsis={{
            rows: 4,
            expandable: true,
          }}
        >
          {overview as string}
        </Text>
      ) : null}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          width: '100%',
        }}
      >
        <SubscribeButton
          show_text
          meta_id={meta.id}
          subscription={meta.subscription ?? null}
        />
      </div>
    </Space>
  )
}
