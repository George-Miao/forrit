import { type ExtractedMeta, use_is_xs } from 'app/util'
import type { CSSProperties } from 'react'
import { useState } from 'react'
import Hint from '../ui/tooltip'
import { getSeasonFromDate } from './season_selector'
import SubscribeButton from './meta_card/subscription'

export const width = '(min(max(100dvw * 0.3, 150px), 300px))'
export const header_height = `calc(60px + 2em + ${width} * 1.5)`

export default function MetaDetailHeader({
  meta,
  vertical = false,
  style,
}: {
  meta: ExtractedMeta
  vertical?: boolean
  style?: CSSProperties
}) {
  const isSmall = use_is_xs()
  const cover = meta.poster ? (
    <img
      alt={`${meta.title} poster`}
      className={
        vertical
          ? 'aspect-[2/3] w-full object-cover'
          : 'rounded-md object-cover'
      }
      src={meta.poster}
      style={
        vertical
          ? undefined
          : { width: `calc(${width})`, height: `calc(${width} * 1.5)` }
      }
    />
  ) : null
  const detail = (
    <MetaDetailText
      meta={meta}
      style={{ minHeight: vertical ? undefined : `calc(${width} * 1.5)` }}
    />
  )

  if (vertical) {
    return (
      <article className="ui-panel overflow-hidden" style={style}>
        {cover}
        <div className="p-5">{detail}</div>
      </article>
    )
  }

  return (
    <div
      className={`flex items-start ${isSmall ? 'gap-4' : 'gap-8'}`}
      style={style}
    >
      {cover}
      {detail}
    </div>
  )
}

function MetaDetailText({
  meta,
  style,
}: {
  meta: ExtractedMeta
  style: CSSProperties
}) {
  const [expanded, setExpanded] = useState(false)
  const { title, year, info, overview, tv } = meta
  const selected = getSeasonFromDate(
    meta.begin ? new Date(meta.begin) : new Date(),
  )
  const editHref = `/subscription?year=${selected.year}&season=${selected.season}&edit=${meta.id}`

  return (
    <div className="flex flex-1 flex-col items-start gap-4" style={style}>
      <h1 className="m-0 text-2xl font-600">
        <Hint content={String(tv?.original_name ?? '')}>
          <span>{title}</span>
        </Hint>
        {year ? (
          <span className="ml-2 text-lg font-300 text-muted">({year})</span>
        ) : null}
      </h1>
      <p className="m-0 text-sm text-muted">
        {info.map((item, index) => (
          <span key={`${item.content}-${index}`}>
            {item.tooltip ? (
              <Hint content={item.tooltip}>
                <span>{item.content}</span>
              </Hint>
            ) : (
              item.content
            )}
            {index < info.length - 1 ? ' · ' : null}
          </span>
        ))}
      </p>
      {overview ? (
        <div>
          <p
            className={`m-0 text-sm leading-6 text-muted ${expanded ? '' : 'line-clamp-4'}`}
          >
            {overview as string}
          </p>
          <button
            className="ui-focus mt-1 cursor-pointer border-0 bg-transparent p-0 text-sm text-accent transition hover:underline active:opacity-60"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded ? '收起' : '展开'}
          </button>
        </div>
      ) : null}
      <div className="flex w-full flex-1 items-end justify-end">
        <SubscribeButton
          editHref={editHref}
          meta_id={meta.id}
          style="with-text"
          subscription={meta.subscription ?? null}
        />
      </div>
    </div>
  )
}
