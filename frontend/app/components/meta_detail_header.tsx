import { Space, Tooltip, Typography } from '@douyinfe/semi-ui'
import { use_is_xs, type ExtractedMeta } from 'app/util'

export const width = '(min(max(100dvw * 0.3, 150px), 300px))'
export const header_height = `calc(60px + 2em + ${width} * 1.5)`

const { Text, Title } = Typography

const placeholder = 'https://placedog.net/2000/3000'

export default function MetaDetailHeader({ meta }: { meta: ExtractedMeta }) {
  const { poster, title, year, info, overview, tv } = meta
  const is_xs = use_is_xs()
  return (
    <Space
      align='start'
      spacing={is_xs ? 'medium' : 'loose'}
      style={{ paddingBottom: '1em' }}
    >
      <img
        alt='backdrop'
        style={{
          width: `calc(${width})`,
          height: `calc(${width} * 1.5)`,
          borderRadius: 'var(--semi-border-radius-medium)',
        }}
        src={poster ?? placeholder}
      />

      <Space
        vertical
        align='start'
        style={{
          minHeight: `calc(${width} * 1.5)`,
        }}
      >
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
                <span style={{ margin: '0 .3em' }}>·</span>
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
      </Space>
    </Space>
  )
}
