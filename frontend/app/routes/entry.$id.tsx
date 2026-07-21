import {
  Link,
  type ClientLoaderFunctionArgs,
  useLoaderData,
} from '@remix-run/react'
import { useClient, useExtractedEntry } from 'app/client'
import Loading from 'app/components/loading'
import PageHeader from 'app/components/page_header'
import WidthLimit from 'app/components/width_limit'
import Button from 'app/ui/button'
import Icon from 'app/ui/icon'
import { formatBytes, type ExtractedEntry } from 'app/util'
import { useState } from 'react'
import useClipboard from 'react-use-clipboard'

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  return { id: params.id as string }
}

export default function EntryDetail() {
  const id = useLoaderData<typeof clientLoader>().id

  return (
    <Loading size="large" useData={() => useExtractedEntry(id)}>
      {(data) => <Loaded entry={data} />}
    </Loading>
  )
}

const titleElementKeys = new Set([
  'AnimeSeason',
  'AnimeTitle',
  'EpisodeNumber',
  'FileName',
  'ReleaseGroup',
])

const keyedTagLabels: Record<string, string> = {
  AudioTerm: '音频',
  VideoTerm: '视频',
}

function Loaded({ entry }: { entry: ExtractedEntry }) {
  return (
    <>
      <EntryHeader entry={entry} />

      <WidthLimit
        data-entry-layout
        maxWidth="1200px"
        style={{
          paddingBottom: '2rem',
          paddingTop: '2rem',
        }}
      >
        <main className="min-w-0" data-entry-main>
          <EntryInfo entry={entry} />
        </main>
      </WidthLimit>
    </>
  )
}

function EntryHeader({ entry }: { entry: ExtractedEntry }) {
  return (
    <PageHeader
      routes={[
        { href: '/', name: '首页' },
        { href: '/entry', name: '更新' },
        { name: '资源详情' },
      ]}
    >
      <div
        className="mt-16 flex w-full items-center justify-between gap-6 max-md:flex-col max-md:items-start"
        data-entry-title
      >
        <div className="min-w-0">
          <EntryTitle entry={entry} />
          <EntryTags entry={entry} />
        </div>

        <EntryActions entry={entry} />
      </div>
    </PageHeader>
  )
}

function EntryTitle({ entry }: { entry: ExtractedEntry }) {
  const seasonValue = entry.elements.AnimeSeason
    ? String(entry.elements.AnimeSeason)
    : null
  const releaseCode = `${seasonValue ? `S${seasonValue}` : ''}${
    entry.episode ? `E${entry.episode}` : ''
  }`
  const bangumiTitle = String(
    entry.meta_title ?? entry.elements.AnimeTitle ?? '资源详情',
  )

  return (
    <h1 className="m-0 break-words text-2xl font-600 leading-tight tracking-tight sm:text-3xl">
      {entry.meta_id ? (
        <Link
          className="no-underline hover:text-accent hover:underline"
          to={`/meta/${entry.meta_id.$oid}`}
        >
          {bangumiTitle}
        </Link>
      ) : (
        bangumiTitle
      )}
      {releaseCode ? (
        <>
          {' '}
          <span className="font-300 text-muted">{releaseCode}</span>
        </>
      ) : null}
    </h1>
  )
}

function EntryTags({ entry }: { entry: ExtractedEntry }) {
  const parsedTags = Object.entries(entry.elements).filter(
    ([key, value]) => !titleElementKeys.has(key) && value,
  )

  return (
    <div className="mt-3 flex flex-wrap gap-2" data-entry-tags>
      {entry.group ? (
        <span className="rounded-full border border-edge bg-background px-3 py-1 text-xs text-muted">
          {entry.group}
        </span>
      ) : null}
      <span className="rounded-full border border-edge bg-background px-3 py-1 text-xs text-muted">
        {entry.link ? (
          <a
            className="no-underline hover:text-accent hover:underline"
            href={entry.link}
            rel="noreferrer"
            target="_blank"
          >
            {entry.sourcer}
          </a>
        ) : (
          entry.sourcer
        )}
      </span>
      {parsedTags.map(([key, value]) => (
        <span
          className="rounded-full border border-edge bg-background px-3 py-1 text-xs text-muted"
          key={key}
        >
          {keyedTagLabels[key] ? `${keyedTagLabels[key]} ` : null}
          {String(value)}
        </span>
      ))}
    </div>
  )
}

function EntryActions({ entry }: { entry: ExtractedEntry }) {
  const client = useClient()
  const [copied, copy] = useClipboard(entry.torrent, {
    successDuration: 1200,
  })
  const [downloaded, setDownloaded] = useState(false)
  const download = () => {
    if (downloaded) return
    void client.POST('/entry/{id}/download', {
      params: { path: { id: entry.id } },
    })
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 1200)
  }

  return (
    <div className="flex shrink-0 gap-2 max-sm:w-full">
      <Button
        className="max-sm:flex-1"
        onClick={download}
        variant="primary"
      >
        <Icon name={downloaded ? 'check' : 'download'} />
        {downloaded ? '已提交' : '下载'}
      </Button>
      <Button className="max-sm:flex-1" onClick={copy}>
        <Icon name={copied ? 'check' : 'copy'} />
        {copied ? '已复制' : '复制链接'}
      </Button>
    </div>
  )
}

function EntryInfo({ entry }: { entry: ExtractedEntry }) {
  const fileName = String(entry.elements.FileName ?? '')

  return (
    <section className="ui-panel min-w-0 p-5 sm:p-6" data-entry-file>
      <h2 className="m-0 mb-5 text-base font-600">资源信息</h2>
      <dl className="m-0 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-[6rem_minmax(0,1fr)]">
        <Detail label="发布标题">
          <span className="break-words font-500">{entry.title}</span>
        </Detail>
        {entry.pub_date ? (
          <Detail label="发布时间">
            <time dateTime={entry.pub_date.toISOString()}>
              {entry.pub_date.toLocaleString()}
            </time>
          </Detail>
        ) : null}
        {fileName && fileName !== entry.title ? (
          <Detail label="文件名">
            <span className="break-all">{fileName}</span>
          </Detail>
        ) : null}
        <Detail label="大小">{formatBytes(entry.size)}</Detail>
        <Detail label="类型">
          <span
            className={
              entry.mime_type === 'application/x-bittorrent'
                ? 'font-mono text-xs'
                : undefined
            }
          >
            {entry.mime_type}
          </span>
        </Detail>
        {entry.guid !== entry.title && entry.guid !== fileName ? (
          <Detail label="GUID">
            <code className="break-all font-mono text-xs">{entry.guid}</code>
          </Detail>
        ) : null}
      </dl>
      {entry.description ? (
        <div
          className="mt-5 border-t border-edge pt-5 text-sm"
          data-entry-body
        >
          <EntryBody html={entry.description} />
        </div>
      ) : null}
    </section>
  )
}

function EntryBody({ html }: { html: string }) {
  return (
    <div
      className="entry-body text-muted"
      // Entry descriptions are sanitized by the server before persistence.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function Detail({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="grid gap-1 sm:contents">
      <dt className="text-muted">{label}</dt>
      <dd className="m-0 min-w-0">{children}</dd>
    </div>
  )
}
