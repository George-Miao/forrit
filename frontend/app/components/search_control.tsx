import { Combobox } from '@base-ui/react/combobox'
import { Dialog } from '@base-ui/react/dialog'
import { useLocation, useNavigate, useSearchParams } from '@remix-run/react'
import { useSearchSuggestions } from 'app/client'
import { HighlightedText } from 'app/components/search_results'
import Icon from 'app/ui/icon'
import { get_title, is_search_query } from 'app/util'
import type { SearchMatch, SearchResult } from 'forrit-client'
import { useEffect, useMemo, useState } from 'react'

interface SearchChoice {
  id: string
  href: string
  kind: 'entry' | 'meta'
  label: string
  detail?: string
  match?: SearchMatch | null
}
interface SearchChoiceGroup {
  items: SearchChoice[]
  label: string
  value: 'metadata' | 'unmatched'
}

export default function SearchControl() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }
      event.preventDefault()
      const input = document.querySelector<HTMLInputElement>('[data-global-search-input]')
      if (input?.offsetParent) {
        input.focus()
      } else {
        setMobileOpen(true)
      }
    }
    document.addEventListener('keydown', focusSearch)
    return () => document.removeEventListener('keydown', focusSearch)
  }, [])

  return (
    <>
      <div className="hidden w-72 md:block">
        <SearchBox />
      </div>
      <Dialog.Root onOpenChange={setMobileOpen} open={mobileOpen}>
        <Dialog.Trigger aria-label="搜索" className="ui-icon-button text-xl md:hidden">
          <Icon name="search" />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-400 min-h-dvh bg-black/25" />
          <Dialog.Popup className="fixed inset-x-3 top-16 z-401 rounded-lg border border-edge bg-surface p-3 shadow-[var(--shadow-card)]">
            <Dialog.Title className="sr-only">搜索</Dialog.Title>
            <SearchBox autoFocus onNavigate={() => setMobileOpen(false)} />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

function SearchBox({
  autoFocus = false,
  onNavigate,
}: {
  autoFocus?: boolean
  onNavigate?: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const routeQuery = location.pathname === '/search' ? (params.get('q') ?? '') : ''
  const [query, setQuery] = useState(routeQuery)
  const [debounced, setDebounced] = useState(routeQuery)
  const [open, setOpen] = useState(autoFocus)

  useEffect(() => {
    if (location.pathname === '/search') setQuery(routeQuery)
  }, [location.pathname, routeQuery])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 200)
    return () => window.clearTimeout(timer)
  }, [query])

  const result = useSearchSuggestions(debounced)
  const choiceGroups = useMemo(() => buildChoiceGroups(result.data), [result.data])

  const openAll = () => {
    if (!is_search_query(query)) return
    onNavigate?.()
    setOpen(false)
    void navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <Combobox.Root
      filter={null}
      inputValue={query}
      open={open}
      itemToStringLabel={(choice: SearchChoice) => choice.label}
      items={choiceGroups}
      onOpenChange={setOpen}
      onInputValueChange={(value, details) => {
        if (details.reason !== 'item-press') setQuery(value)
      }}
      onValueChange={(choice: SearchChoice | null) => {
        if (!choice) return
        onNavigate?.()
        setOpen(false)
        void navigate(choice.href)
      }}
    >
      <Combobox.InputGroup className="ui-focus relative flex h-10 w-full items-center rounded-md border border-edge bg-background shadow-sm focus-within:border-accent">
        <Icon className="ml-3 text-muted" name="search" />
        <Combobox.Input
          aria-label="搜索番剧和条目"
          autoComplete="off"
          autoFocus={autoFocus}
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-base text-text outline-none placeholder:text-muted md:text-sm"
          data-global-search-input={!autoFocus || undefined}
          maxLength={200}
          onKeyDown={event => {
            if (
              event.key === 'Enter' &&
              !event.currentTarget.getAttribute('aria-activedescendant')
            ) {
              event.preventDefault()
              openAll()
            }
          }}
          placeholder="搜索番剧、别名或条目"
        />
        <kbd className="mr-2 hidden rounded border border-edge bg-surface px-1.5 py-0.5 text-xs text-muted lg:inline">
          /
        </kbd>
      </Combobox.InputGroup>
      <Combobox.Portal>
        <Combobox.Positioner className="z-500 outline-none" sideOffset={autoFocus ? 18 : 6}>
          <Combobox.Popup className="ui-popup w-[min(32rem,var(--available-width))] overflow-hidden rounded-lg border border-edge bg-surface shadow-[var(--shadow-card)]">
            <SearchStatus
              data={result.data}
              error={result.error}
              isLoading={result.isLoading}
              query={debounced}
              retry={() => void result.mutate()}
            />
            {choiceGroups.length ? (
              <Combobox.List className="max-h-[min(30rem,var(--available-height))] overflow-y-auto overscroll-contain py-1 outline-none">
                {choiceGroups.map((group, index) => (
                  <Combobox.Group items={group.items} key={group.value}>
                    {index ? <Combobox.Separator className="mb-3 mt-1 h-px bg-edge" /> : null}
                    <Combobox.GroupLabel className="px-3 pb-1 text-xs font-600 uppercase tracking-wide text-muted">
                      {group.label}
                    </Combobox.GroupLabel>
                    <Combobox.Collection>
                      {(choice: SearchChoice) => (
                        <Combobox.Item
                          className={`mx-1 cursor-pointer rounded-md px-3 py-1.5 text-sm outline-none transition hover:bg-[rgb(28_31_35/5%)] data-highlighted:bg-[rgb(28_31_35/5%)] ${
                            choice.kind === 'meta'
                              ? 'search-preview-meta mt-1 bg-[rgb(28_31_35/3%)] py-2'
                              : 'search-preview-entry'
                          }`}
                          key={choice.id}
                          value={choice}
                        >
                          <div className="flex min-w-0 items-start gap-2">
                            {choice.kind === 'meta' ? (
                              <Icon
                                className="mt-0.5 text-base text-accent"
                                name="tv"
                              />
                            ) : null}
                            <div className="min-w-0 flex-1">
                              <span
                                className={`block truncate text-text ${
                                  choice.kind === 'meta' ? 'font-600' : 'font-500'
                                }`}
                              >
                                <HighlightedText match={choice.match} text={choice.label} />
                              </span>
                              {choice.detail ? (
                                <span className="mt-0.5 block truncate text-xs text-muted">
                                  <HighlightedText match={choice.match} text={choice.detail} />
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </Combobox.Item>
                      )}
                    </Combobox.Collection>
                  </Combobox.Group>
                ))}
              </Combobox.List>
            ) : null}
            {is_search_query(debounced) ? (
              <button
                className="ui-focus mx-1 mb-1 w-[calc(100%-0.5rem)] rounded-md border-0 bg-surface px-3 py-2 text-left text-sm font-500 text-accent transition hover:bg-[rgb(28_31_35/5%)]"
                onClick={openAll}
                type="button"
              >
                查看“{debounced}”的全部结果
              </button>
            ) : null}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

function SearchStatus({
  data,
  error,
  isLoading,
  query,
  retry,
}: {
  data?: SearchResult
  error: unknown
  isLoading: boolean
  query: string
  retry: () => void
}) {
  if (!is_search_query(query)) {
    return <p className="m-0 px-4 py-5 text-sm text-muted">输入一个中文字符或两个英文字母开始搜索</p>
  }
  if (isLoading) {
    return <p className="m-0 px-4 py-5 text-sm text-muted">正在搜索...</p>
  }
  if (error) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-4 text-sm text-accent">
        <span>搜索失败</span>
        <button className="ui-focus rounded border border-edge bg-surface px-3 py-1" onClick={retry} type="button">
          重试
        </button>
      </div>
    )
  }
  if (
    data &&
    !data.metadata?.items.length &&
    !data.unmatched_entries?.items.length
  ) {
    return <p className="m-0 px-4 py-5 text-sm text-muted">没有找到匹配结果</p>
  }
  return null
}

function buildChoiceGroups(data: SearchResult | undefined): SearchChoiceGroup[] {
  if (!data) return []

  const metadata: SearchChoice[] = []
  for (const group of data.metadata?.items ?? []) {
    const metaId = group.meta._id.$oid
    metadata.push({
      id: `meta-${metaId}`,
      href: `/meta/${metaId}`,
      kind: 'meta',
      label: get_title(group.meta),
      detail: group.matched_by?.text,
      match: group.matched_by,
    })
    for (const hit of group.entries) {
      metadata.push({
        id: `entry-${hit.entry._id.$oid}`,
        href: `/entry/${hit.entry._id.$oid}`,
        kind: 'entry',
        label: hit.entry.title,
        detail:
          hit.matched_by && hit.matched_by.field !== 'entry_title'
            ? hit.matched_by.text
            : get_title(group.meta),
        match: hit.matched_by,
      })
    }
  }

  const unmatched: SearchChoice[] = (data.unmatched_entries?.items ?? []).map(
    hit => ({
      id: `unmatched-${hit.entry._id.$oid}`,
      href: `/entry/${hit.entry._id.$oid}`,
      kind: 'entry',
      label: hit.entry.title,
      detail:
        hit.matched_by?.field === 'entry_title'
          ? undefined
          : hit.matched_by?.text,
      match: hit.matched_by,
    }),
  )

  const groups: SearchChoiceGroup[] = []
  if (metadata.length) {
    groups.push({ items: metadata, label: '番剧', value: 'metadata' })
  }
  if (unmatched.length) {
    groups.push({ items: unmatched, label: '未匹配条目', value: 'unmatched' })
  }
  return groups
}
