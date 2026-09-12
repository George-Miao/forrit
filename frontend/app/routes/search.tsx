import { Form, Link, useSearchParams } from '@remix-run/react'
import {
  getSearchSection,
  useMeta,
  useSearch,
  useSearchMetaEntries,
} from 'app/client'
import {
  SearchEntryRow,
  SearchMetaGroupCard,
} from 'app/components/search_results'
import WidthLimit from 'app/components/width_limit'
import Button from 'app/ui/button'
import Icon from 'app/ui/icon'
import { get_title, is_search_query } from 'app/util'
import type {
  SearchEntryHit,
  SearchMetaGroup,
  SearchSection,
} from 'forrit-client'
import { type ReactNode, useState } from 'react'

export const meta = () => [{ title: '搜索 - Forrit' }]

export default function SearchRoute() {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  const metaId = params.get('meta')

  return (
    <WidthLimit className="py-10">
      {metaId ? null : <SearchHeader key={query} query={query} />}
      {!is_search_query(query) ? (
        <SearchMessage>输入一个中文字符或两个英文字母开始搜索</SearchMessage>
      ) : metaId ? (
        <FocusedEntries key={`${metaId}:${query}`} metaId={metaId} query={query} />
      ) : (
        <SearchResults key={query} query={query} />
      )}
    </WidthLimit>
  )
}

function SearchHeader({ query }: { query: string }) {
  return (
    <header className="mb-8">
      <h1 className="mb-4 mt-0 text-3xl font-600">搜索</h1>
      <Form className="flex max-w-2xl gap-2" method="get">
        <label className="ui-focus flex h-11 min-w-0 flex-1 items-center rounded-md border border-edge bg-surface px-3 focus-within:border-accent">
          <Icon className="mr-2 text-muted" name="search" />
          <span className="sr-only">搜索番剧和条目</span>
          <input
            autoComplete="off"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-base outline-none placeholder:text-muted"
            defaultValue={query}
            maxLength={200}
            name="q"
            placeholder="搜索番剧、别名或条目"
          />
        </label>
        <Button type="submit" variant="primary">
          搜索
        </Button>
      </Form>
    </header>
  )
}

function SearchResults({ query }: { query: string }) {
  const result = useSearch(query)
  const [moreMetadata, setMoreMetadata] = useState<SearchMetaGroup[]>([])
  const [moreEntries, setMoreEntries] = useState<SearchEntryHit[]>([])
  const [metadataCursor, setMetadataCursor] = useState<string | null>()
  const [entryCursor, setEntryCursor] = useState<string | null>()
  const [loadingSection, setLoadingSection] = useState<SearchSection | null>(null)
  const [sectionError, setSectionError] = useState<SearchSection | null>(null)

  if (result.isLoading) return <SearchMessage>正在搜索...</SearchMessage>
  if (result.error) {
    return (
      <SearchMessage>
        <span>搜索失败</span>
        <Button className="ml-3" onClick={() => void result.mutate()} type="button">
          重试
        </Button>
      </SearchMessage>
    )
  }

  const metadata = [...(result.data?.metadata?.items ?? []), ...moreMetadata]
  const entries = [
    ...(result.data?.unmatched_entries?.items ?? []),
    ...moreEntries,
  ]
  const nextMetadata =
    metadataCursor === undefined
      ? result.data?.metadata?.next_cursor
      : metadataCursor
  const nextEntries =
    entryCursor === undefined
      ? result.data?.unmatched_entries?.next_cursor
      : entryCursor

  if (!metadata.length && !entries.length) {
    return <SearchMessage>没有找到“{query}”的匹配结果</SearchMessage>
  }

  const loadMore = async (section: SearchSection) => {
    const cursor = section === 'metadata' ? nextMetadata : nextEntries
    if (!cursor) return
    setLoadingSection(section)
    setSectionError(null)
    try {
      const page = await getSearchSection(query, section, cursor)
      if (section === 'metadata') {
        setMoreMetadata(current => [...current, ...(page.metadata?.items ?? [])])
        setMetadataCursor(page.metadata?.next_cursor ?? null)
      } else {
        setMoreEntries(current => [
          ...current,
          ...(page.unmatched_entries?.items ?? []),
        ])
        setEntryCursor(page.unmatched_entries?.next_cursor ?? null)
      }
    } catch {
      setSectionError(section)
    } finally {
      setLoadingSection(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10">
      {metadata.length ? (
        <section aria-labelledby="metadata-results">
          <h2 className="mb-4 mt-0 text-xl font-600" id="metadata-results">
            番剧
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {metadata.map(group => (
              <SearchMetaGroupCard group={group} key={group.meta._id.$oid} query={query} />
            ))}
          </div>
          <SectionMore
            error={sectionError === 'metadata'}
            loading={loadingSection === 'metadata'}
            onClick={() => void loadMore('metadata')}
            visible={Boolean(nextMetadata)}
          />
        </section>
      ) : null}
      {entries.length ? (
        <section aria-labelledby="entry-results">
          <h2 className="mb-0 mt-0 text-xl font-600" id="entry-results">
            未匹配条目
          </h2>
          <div className="search-entry-list">
            {entries.map(hit => (
              <SearchEntryRow hit={hit} key={hit.entry._id.$oid} />
            ))}
          </div>
          <SectionMore
            error={sectionError === 'unmatched'}
            loading={loadingSection === 'unmatched'}
            onClick={() => void loadMore('unmatched')}
            visible={Boolean(nextEntries)}
          />
        </section>
      ) : null}
    </div>
  )
}

function FocusedEntries({ metaId, query }: { metaId: string; query: string }) {
  const meta = useMeta(metaId)
  const result = useSearchMetaEntries(metaId, query)
  const pages = result.data ?? []
  const entries = pages.flatMap(page => page.items)
  const next = pages.at(-1)?.next_cursor

  if (meta.isLoading || result.isLoading) return <SearchMessage>正在搜索...</SearchMessage>
  if (meta.error || (result.error && !pages.length)) {
    return (
      <SearchMessage>
        <span>搜索失败</span>
        <Button
          className="ml-3"
          onClick={() => {
            void meta.mutate()
            void result.mutate()
          }}
          type="button"
        >
          重试
        </Button>
      </SearchMessage>
    )
  }
  if (!meta.data) return <SearchMessage>番剧不存在</SearchMessage>

  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <Link className="text-sm no-underline hover:underline" to={`/search?q=${encodeURIComponent(query)}`}>
            返回全部结果
          </Link>
          <h2 className="mb-0 mt-2 text-xl font-600">{get_title(meta.data)}的匹配条目</h2>
        </div>
      </div>
      {entries.length ? (
        <div className="search-entry-list">
          {entries.map(hit => (
            <SearchEntryRow hit={hit} key={hit.entry._id.$oid} />
          ))}
        </div>
      ) : (
        <SearchMessage>没有匹配条目</SearchMessage>
      )}
      <SectionMore
        error={Boolean(result.error)}
        loading={result.isValidating}
        onClick={() => {
          if (result.error) {
            void result.mutate()
          } else {
            void result.setSize(result.size + 1)
          }
        }}
        visible={Boolean(next) || Boolean(result.error)}
      />
    </section>
  )
}

function SearchMessage({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-edge bg-surface p-6 text-muted">{children}</div>
}

function SectionMore({
  error,
  loading,
  onClick,
  visible,
}: {
  error: boolean
  loading: boolean
  onClick: () => void
  visible: boolean
}) {
  if (!visible && !error) return null
  return (
    <div className="mt-4 text-center">
      {error ? <p className="text-sm text-accent">加载失败，请重试</p> : null}
      <Button disabled={loading} onClick={onClick} type="button">
        {loading ? '正在加载...' : '加载更多'}
      </Button>
    </div>
  )
}
