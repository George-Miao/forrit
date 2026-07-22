import { Link } from '@remix-run/react'
import { useClient } from 'app/client'
import Button from 'app/ui/button'
import Icon from 'app/ui/icon'
import PreviewPopover from 'app/ui/popover'
import Hint from 'app/ui/tooltip'
import { type ExtractedEntry, format_time_relative, use_is_xs } from 'app/util'
import { useState } from 'react'
import reactStringReplace from 'react-string-replace'
import useClipboard from 'react-use-clipboard'
import MetaPreview from '../meta_preview'

export interface EntryListItemProps {
  show_meta: boolean
  item: ExtractedEntry
}

export default function EntryListItem({ item, show_meta }: EntryListItemProps) {
  const [copied, copy] = useClipboard(item.torrent, { successDuration: 1000 })
  const [downloaded, setDownloaded] = useState(false)
  const client = useClient()
  const isSmall = use_is_xs()

  const download = () => {
    if (downloaded) return
    void client.POST('/entry/{id}/download', {
      params: { path: { id: item.id } },
    })
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 1000)
  }

  const episode = item.elements.EpisodeNumber
    ? `第${item.elements.EpisodeNumber}集`
    : null
  const parsedTitle =
    typeof item.elements.AnimeTitle === 'string'
      ? item.elements.AnimeTitle
      : null
  const metaText = (
    <span className={show_meta ? 'font-300' : 'font-500'}>
      {show_meta ? (
        item.meta_id ? (
          <Link
            className="mr-2 font-500 no-underline hover:underline"
            to={`/meta/${item.meta_id.$oid}`}
          >
            {item.meta_title}
          </Link>
        ) : (
          <span className="mr-2 inline-flex items-center gap-1.5 font-500">
            {parsedTitle ? <span className="text-muted">{parsedTitle}</span> : null}
            <Hint content="此条目未匹配到番剧">
              <span
                aria-label="未匹配条目"
                className="ui-focus inline-flex text-accent"
                role="img"
                tabIndex={0}
              >
                <Icon name="warning" />
              </span>
            </Hint>
          </span>
        )
      ) : null}
      {episode}
    </span>
  )

  const controls = (
    <div className={`flex gap-1 ${isSmall ? 'self-end' : ''}`}>
      <Hint content="复制链接">
        <Button
          aria-label="复制链接"
          className={isSmall ? '' : 'h-9 w-9 p-0'}
          onClick={copy}
          variant="ghost"
        >
          <Icon name={copied ? 'check' : 'copy'} />
          {isSmall ? '复制' : null}
        </Button>
      </Hint>
      <Hint content="下载">
        <Button
          aria-label="下载"
          className={isSmall ? '' : 'h-9 w-9 p-0'}
          onClick={download}
          variant="ghost"
        >
          <Icon name={downloaded ? 'check' : 'download'} />
          {isSmall ? '下载' : null}
        </Button>
      </Hint>
    </div>
  )

  return (
    <article className="flex w-full items-center gap-4 py-5 max-sm:items-start max-sm:py-6">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <div className="flex flex-wrap gap-2 font-300 text-xs text-muted">
          {item.pub_date ? (
            <Hint content={item.pub_date.toLocaleString()} side="right">
              <time dateTime={item.pub_date.toISOString()}>
                {format_time_relative(item.pub_date)}
              </time>
            </Hint>
          ) : null}
          <span>
            来自{' '}
            {item.link ? (
              <a
                className="inline-block max-w-60 truncate align-bottom hover:underline"
                href={item.link}
                rel="noreferrer"
                target="_blank"
              >
                {item.sourcer}
              </a>
            ) : (
              item.sourcer
            )}
          </span>
        </div>
        {item.meta_id ? (
          isSmall ? (
            metaText
          ) : (
            <PreviewPopover
              content={<MetaPreview meta_id={item.meta_id.$oid} />}
            >
              {metaText}
            </PreviewPopover>
          )
        ) : show_meta ? (
          metaText
        ) : null}
        <Link
          className={`break-all font-300 tracking-tight text-muted no-underline hover:underline ${show_meta ? 'text-xs' : 'text-base'
            }`}
          to={`/entry/${item.id}`}
        >
          {item.group
            ? reactStringReplace(item.title, item.group, () => (
              <span className="text-accent">{item.group}</span>
            ))
            : item.title}
        </Link>
        {isSmall ? controls : null}
      </div>
      {isSmall ? null : controls}
    </article>
  )
}
