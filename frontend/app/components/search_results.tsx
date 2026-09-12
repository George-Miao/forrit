import { Link } from '@remix-run/react'
import EntryListItem from 'app/components/entry_list/item'
import MetaPanelSummary from 'app/components/meta_panel_summary'
import { extract_entry, get_title } from 'app/util'
import type {
  SearchEntryHit,
  SearchMatch,
  SearchMetaGroup,
} from 'forrit-client'
import type { ReactNode } from 'react'

const fieldLabels: Record<SearchMatch['field'], string> = {
  meta_title: '番剧标题',
  tmdb_name: 'TMDB 标题',
  alias: '匹配别名',
  entry_title: '条目标题',
  parsed_title: '解析标题',
  torrent_name: '种子文件名',
}

export function HighlightedText({
  match,
  text,
}: {
  match?: SearchMatch | null
  text: string
}) {
  if (!match || match.text !== text || !match.fragments.length) return text

  const ranges = findRanges(text, match.fragments)
  if (!ranges.length) return text

  const parts: ReactNode[] = []
  let offset = 0
  for (const [start, end] of ranges) {
    if (offset < start) parts.push(text.slice(offset, start))
    parts.push(
      <mark className="rounded-sm bg-[rgb(249_57_32/10%)] text-inherit" key={`${start}-${end}`}>
        {text.slice(start, end)}
      </mark>,
    )
    offset = end
  }
  if (offset < text.length) parts.push(text.slice(offset))
  return parts
}

export function SearchEntryRow({ hit }: { hit: SearchEntryHit }) {
  const match = hit.matched_by
  const alternate = match && match.field !== 'entry_title'

  return (
    <EntryListItem
      detail={
        alternate ? (
          <p className="m-0 truncate text-xs text-muted">
            <span className="mr-1 font-500">{fieldLabels[match.field]}</span>
            <HighlightedText match={match} text={match.text} />
          </p>
        ) : null
      }
      item={extract_entry(hit.entry)}
      show_meta={false}
      title={
        match?.field === 'entry_title' ? (
          <HighlightedText match={match} text={hit.entry.title} />
        ) : undefined
      }
    />
  )
}

export function SearchMetaGroupCard({
  group,
  query,
}: {
  group: SearchMetaGroup
  query: string
}) {
  const id = group.meta._id.$oid
  const title = get_title(group.meta)
  const match = group.matched_by
  const alternate = match && match.text !== title

  return (
    <article className="ui-panel grid grid-cols-1 overflow-hidden sm:grid-cols-[7rem_minmax(0,1fr)]">
      <MetaPanelSummary
        meta={group.meta}
        showCalendarSeason
        title={<HighlightedText match={match} text={title} />}
      >
        {alternate ? (
          <p className="mb-0 mt-2 text-sm text-muted">
            <span className="mr-2 rounded bg-background px-2 py-1 text-xs font-500">
              {fieldLabels[match.field]}
            </span>
            <HighlightedText match={match} text={match.text} />
          </p>
        ) : null}
      </MetaPanelSummary>
      {group.entries.length ? (
        <div className="search-entry-list search-entry-list-bordered col-span-full px-4 sm:px-5">
          {group.entries.map(hit => (
            <SearchEntryRow hit={hit} key={hit.entry._id.$oid} />
          ))}
        </div>
      ) : null}
      {group.matching_entry_count > 0 ? (
        <div className="search-entry-footer col-span-full px-4 py-3 text-right sm:px-5">
          <Link
            className="text-sm font-500 no-underline hover:underline"
            to={`/search?q=${encodeURIComponent(query)}&meta=${id}`}
          >
            查看 {group.matching_entry_count} 个匹配条目
          </Link>
        </div>
      ) : null}
    </article>
  )
}

function findRanges(text: string, fragments: string[]): Array<[number, number]> {
  const normalized = mappedNormalize(text)
  const ranges: Array<[number, number]> = []

  for (const fragment of fragments) {
    const needle = mappedNormalize(fragment).text
    if (!needle) continue
    let from = 0
    while (from <= normalized.text.length - needle.length) {
      const at = normalized.text.indexOf(needle, from)
      if (at < 0) break
      const start = normalized.map[at]?.[0]
      const end = normalized.map[at + needle.length - 1]?.[1]
      if (start !== undefined && end !== undefined) ranges.push([start, end])
      from = at + Math.max(needle.length, 1)
    }
  }

  ranges.sort((left, right) => left[0] - right[0] || left[1] - right[1])
  return ranges.reduce<Array<[number, number]>>((merged, range) => {
    const last = merged.at(-1)
    if (!last || range[0] > last[1]) {
      merged.push(range)
    } else {
      last[1] = Math.max(last[1], range[1])
    }
    return merged
  }, [])
}

function mappedNormalize(text: string) {
  let normalized = ''
  const map: Array<[number, number]> = []
  let sourceOffset = 0
  let separated = true

  for (const character of text) {
    const end = sourceOffset + character.length
    const segment = character.normalize('NFKC').toLowerCase()
    for (const output of segment) {
      if (/[\s_/\\／・·-]/u.test(output)) {
        if (!separated) {
          normalized += ' '
          map.push([sourceOffset, end])
          separated = true
        }
      } else {
        normalized += output
        for (let index = 0; index < output.length; index += 1) {
          map.push([sourceOffset, end])
        }
        separated = false
      }
    }
    sourceOffset = end
  }

  if (normalized.endsWith(' ')) {
    normalized = normalized.slice(0, -1)
    map.pop()
  }
  return { text: normalized, map }
}
