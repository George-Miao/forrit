import {
  Button,
  ButtonGroup,
  List,
  Popover,
  Space,
  Tag,
  Tooltip,
  Typography,
} from '@douyinfe/semi-ui'
import type { ExtractedEntry } from '.'
import { format_time_relative, use_is_xs } from 'app/util'
import { IconCheckboxTick, IconCopy, IconDownload } from '@douyinfe/semi-icons'
import useClipboard from 'react-use-clipboard'
import MetaPreview from '../meta_preview'
import { useClient } from 'app/client'
import { useState } from 'react'

const { Text, Paragraph } = Typography

export interface EntryListItemProps {
  show_meta: boolean
  is_md: boolean
  item: ExtractedEntry
}

export default function EntryListItem({
  item,
  is_md,
  show_meta,
}: EntryListItemProps) {
  const [copied, copy] = useClipboard(item.torrent, {
    successDuration: 1000,
  })
  const [downloaded, setDownloaded] = useState(false)
  const client = useClient()
  const is_xs = use_is_xs()

  const meta_link = item.meta_id ? (
    <Text
      size='small'
      link={{ href: `/meta/${item.meta_id?.$oid}` }}
      style={{
        fontWeight: 400,
        maxWidth: '15em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {item.meta_title}
    </Text>
  ) : null

  const sourcer = (
    <Text
      size='small'
      style={{
        color: 'var(--semi-color-text-1)',
        fontWeight: 400,
        maxWidth: '15em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
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
      {`来源: ${item.sourcer}`}
    </Text>
  )

  const main = (
    <Space
      vertical
      align='start'
      style={
        {
          overflow: 'hidden',
          '--semi-color-link': 'var(--semi-color-text-0)',
          '--semi-color-link-active': 'var(--semi-color-text-0)',
          '--semi-color-link-hover': 'var(--semi-color-text-0)',
          '--semi-color-link-visited': 'var(--semi-color-text-0)',
        } as React.CSSProperties
      }
      className='entry-list-item'
    >
      <Paragraph>
        {/* Publish Datetime */}
        {item.pub_date ? (
          <Tooltip position='right' content={item.pub_date.toLocaleString()}>
            <Text
              size='small'
              type='tertiary'
              style={{
                marginRight: '.8em',
              }}
            >
              {format_time_relative(item.pub_date)}
            </Text>
          </Tooltip>
        ) : null}
        {/* Entry title */}
        <Text
          size={is_md ? 'small' : 'normal'}
          link={{ href: `/entry/${item.id}` }}
          style={{
            wordWrap: 'break-word',
            wordBreak: 'break-all',
            cursor: item.link ? 'pointer' : 'default',
            fontWeight: 400,
          }}
        >
          {item.title}
        </Text>
      </Paragraph>

      {/* Tags */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5em',
          rowGap: '0.4em',
        }}
      >
        {/* Entry Group */}
        {item.group ? (
          <Tag shape='circle' color='orange' type='light'>
            {item.group}
          </Tag>
        ) : null}

        {/* Entry bangumi name */}
        {show_meta && item.meta_id && item.meta_id ? (
          <Tag shape='circle' color='teal' type='light'>
            {is_xs ? (
              meta_link
            ) : (
              <Popover
                content={<MetaPreview id={item.meta_id?.$oid} />}
                trigger='hover'
              >
                {meta_link}
              </Popover>
            )}
          </Tag>
        ) : null}

        {/* Sourcer */}
        <Tag shape='circle' color='grey' type='ghost'>
          {sourcer}
        </Tag>
      </div>
    </Space>
  )

  return (
    <List.Item
      style={{ padding: '0.5em 0' }}
      main={main}
      extra={
        <ButtonGroup>
          <Tooltip content='复制链接'>
            <Button
              theme='borderless'
              icon={copied ? <IconCheckboxTick /> : <IconCopy />}
              onClick={copy}
            />
          </Tooltip>
          {/* TODO: Create download job */}
          <Tooltip content='下载'>
            <Button
              theme='borderless'
              icon={downloaded ? <IconCheckboxTick /> : <IconDownload />}
              onClick={() => {
                if (downloaded) return
                client.POST('/download', {
                  body: {
                    state: 'pending',
                    entry_id: { $oid: item.id },
                    meta_id: item.meta_id,
                  },
                })
                setDownloaded(true)
                setTimeout(() => setDownloaded(false), 1000)
              }}
            />
          </Tooltip>
        </ButtonGroup>
      }
    />
  )
}
