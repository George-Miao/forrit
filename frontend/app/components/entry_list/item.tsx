import {
  Button,
  ButtonGroup,
  List,
  Popover,
  Space,
  Tooltip,
  Typography,
} from '@douyinfe/semi-ui'
import { type ExtractedEntry, format_time_relative, use_is_xs } from 'app/util'
import { IconCheckboxTick, IconCopy, IconDownload } from '@douyinfe/semi-icons'
import useClipboard from 'react-use-clipboard'
import MetaPreview from '../meta_preview'
import { useClient } from 'app/client'
import { type CSSProperties, useState } from 'react'
import './item.css'
import reactStringReplace from 'react-string-replace'

const { Text } = Typography

export interface EntryListItemProps {
  show_meta: boolean
  item: ExtractedEntry
}

export default function EntryListItem({
  item,

  show_meta,
}: EntryListItemProps) {
  const [copied, copy] = useClipboard(item.torrent, {
    successDuration: 1000,
  })
  const [downloaded, setDownloaded] = useState(false)
  const client = useClient()
  const is_xs = use_is_xs()

  const download = () => {
    if (downloaded) return
    client.POST('/entry/{id}/download', {
      params: {
        path: {
          id: item.id,
        },
      },
    })
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 1000)
  }

  const detail = (
    <Space align='start'>
      {/* Date */}
      {item.pub_date ? (
        <Tooltip position='right' content={item.pub_date.toLocaleString()}>
          <Text size='small' type='tertiary'>
            {format_time_relative(item.pub_date)}
          </Text>
        </Tooltip>
      ) : null}

      {/* Sourcer */}
      <Text type='tertiary' size='small'>
        来自
        <Text
          size='inherit'
          weight={400}
          style={{
            maxWidth: '15em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginLeft: '.2em',
          }}
          link={
            item.link
              ? {
                  href: item.link,
                  target: '_blank',
                }
              : undefined
          }
        >
          {item.sourcer}
        </Text>
      </Text>
    </Space>
  )

  const episode = item.elements.EpisodeNumber ? (
    <>第{item.elements.EpisodeNumber}集</>
  ) : null

  const meta_text = (
    <Text style={{ fontSize: '16px', fontWeight: show_meta ? 300 : 500 }}>
      <>
        {show_meta && item.meta_id && (
          <Text
            style={{
              fontSize: 'inherit',
              textDecoration: 'none',
              fontWeight: 500,
              marginRight: '.5em',
            }}
            link={{ href: `/meta/${item.meta_id?.$oid}` }}
          >
            {item.meta_title}
          </Text>
        )}
        {episode}
      </>
    </Text>
  )

  const meta =
    item.meta_id &&
    (is_xs ? (
      meta_text
    ) : (
      <Popover
        content={<MetaPreview id={item.meta_id?.$oid} />}
        trigger='hover'
        position='right'
      >
        {meta_text}
      </Popover>
    ))

  const title = (
    <Text
      size={show_meta ? 'small' : 'normal'}
      link={{ href: `/entry/${item.id}` }}
      style={
        {
          wordWrap: 'break-word',
          wordBreak: 'break-all',
          cursor: item.link ? 'pointer' : 'default',
          fontWeight: 400,
          letterSpacing: '-0.5px',
          '--semi-color-link': 'var(--semi-color-text-2)',
        } as CSSProperties
      }
    >
      {item.group
        ? reactStringReplace(item.title, item.group, () => (
            <Text size='inherit' style={{ color: 'rgba(var(--semi-teal-7))' }}>
              {item.group}
            </Text>
          ))
        : item.title}
    </Text>
  )

  const non_xs_buttons = (
    <ButtonGroup>
      <Tooltip content='复制链接'>
        <Button
          theme='borderless'
          style={{ color: 'rgba(var(--semi-grey-3))' }}
          icon={copied ? <IconCheckboxTick /> : <IconCopy />}
          onClick={copy}
        />
      </Tooltip>
      <Tooltip content='下载'>
        <Button
          theme='borderless'
          icon={downloaded ? <IconCheckboxTick /> : <IconDownload />}
          onClick={download}
        />
      </Tooltip>
    </ButtonGroup>
  )

  const xs_buttons = (
    <ButtonGroup style={{ alignSelf: 'flex-end' }}>
      <Button
        theme='borderless'
        style={{
          color: 'rgba(var(--semi-grey-3))',
        }}
        icon={
          copied ? <IconCheckboxTick size='small' /> : <IconCopy size='small' />
        }
        onClick={copy}
      >
        复制
      </Button>
      <Button
        theme='borderless'
        icon={
          downloaded ? (
            <IconCheckboxTick size='small' />
          ) : (
            <IconDownload size='small' />
          )
        }
        onClick={download}
      >
        下载
      </Button>
    </ButtonGroup>
  )

  return (
    <List.Item
      style={{
        width: '100%',
        padding: '16px 0',
        paddingTop: is_xs ? '24px' : undefined,
      }}
      main={
        <Space
          vertical
          align='start'
          className='entry-list-item'
          spacing='tight'
        >
          {/* Date and Sourcer */}
          {detail}

          {/* Entry bangumi name */}
          {meta}

          {/* Title */}
          {title}

          {/* Buttons */}
          {is_xs ? xs_buttons : null}
        </Space>
      }
      extra={is_xs ? null : non_xs_buttons}
    />
  )
}
