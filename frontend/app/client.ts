import type {
  DirectedCursor,
  ListResult,
  SearchEntryPage,
  SearchResult,
  SearchSection,
  Season,
  components,
  paths,
} from 'forrit-client'
import create_client, { type FetchResponse } from 'openapi-fetch'
import useSWR, {
  type KeyedMutator,
  type SWRResponse,
  useSWRConfig,
} from 'swr'
import useSWRInfinite from 'swr/infinite'
import {
  type ExtractedEntry,
  type ExtractedMeta,
  extract_entry,
  extract_meta,
  is_search_query,
} from './util'

type JsonMedia = 'application/json'
type Operation = Record<string | number, unknown>

export type Ret<T> =
  | {
    data: T
    isLoading: false
    error: null
  }
  | {
    data: undefined
    isLoading: true
    error: null
  }
  | {
    data: undefined
    isLoading: false
    error: unknown
  }

const get_edge = (cursor: DirectedCursor) =>
  'Backwards' in cursor ? cursor.Backwards : cursor.Forward

const handle = <T>(
  x: SWRResponse<T, unknown, unknown>
): Ret<T> & {
  mutate: KeyedMutator<T>
} => {
  return x as Ret<T> & { mutate: KeyedMutator<T> }
}

export const map = <T, U>(x: Ret<T>, f: (x: T) => U): Ret<U> => {
  if (x.data !== undefined)
    return { isLoading: false, error: null, data: f(x.data) }
  return x as Ret<U>
}

const createClient = () => create_client<paths>({ baseUrl: '/api' })

export const useClient = createClient
export type ConfigView =
  components['schemas']['forrit_server.config.ConfigView']
export type ConfigField =
  components['schemas']['forrit_server.config.ConfigField']
export type ConfigUpdate =
  components['schemas']['forrit_server.config.ConfigUpdate']
export type ConfigValue =
  components['schemas']['forrit_server.config.ConfigValue']
export type ConfigSourceInput =
  components['schemas']['forrit_server.config.SourceInputType']
export type ConfigSourceView =
  components['schemas']['forrit_server.config.SourceView']

// [resource, cursor?]
type InfKey = [string, string?]

const get_key =
  <T>(resource: string) =>
    (i: number, prev: ListResult<T>): InfKey | null =>
      i === 0
        ? [resource]
        : prev.page_info.has_next_page
          ? [resource, get_edge(prev.page_info.end_cursor as DirectedCursor)]
          : null

const throw_it = <T extends Operation, O>(
  resp: FetchResponse<T, O, JsonMedia>,
) => {
  if (resp.error) throw resp.error
  return resp.data
}

const require_data = <T>(data: T | undefined): T => {
  if (data === undefined) throw new Error('响应缺少数据')
  return data
}

function make_inf<T extends Operation, O>(
  resource: string,
  req: (key: InfKey) => Promise<FetchResponse<T, O, JsonMedia>>
) {
  return () =>
    useSWRInfinite(get_key(resource), (key: InfKey) => req(key).then(throw_it))
}

// [resource, id, cursor?]
type IdInfKey = [string, string, string?]

const get_key_with_id =
  <T>(id: string, resource: string) =>
    (i: number, prev: ListResult<T>): IdInfKey | null =>
      i === 0
        ? [resource, id]
        : prev.page_info.has_next_page
          ? [resource, id, get_edge(prev.page_info.end_cursor as DirectedCursor)]
          : null

function make_inf_with_id<O extends Operation, T>(
  resource: string,
  req: (key: IdInfKey) => Promise<FetchResponse<O, T, JsonMedia>>
) {
  return (id: string) =>
    useSWRInfinite(get_key_with_id(id, resource), (key: IdInfKey) =>
      req(key).then(throw_it)
    )
}

function make_get<P extends Operation, O>(
  resource: string,
  req: (id: string) => Promise<FetchResponse<P, O, JsonMedia>>
) {
  return (id: string) =>
    handle(useSWR([resource, id], ([, id]) => req(id).then(throw_it)))
}
export const getConfiguration = (): Promise<ConfigView> =>
  createClient()
    .GET('/config')
    .then(throw_it)
    .then(require_data)

export const useConfiguration = () =>
  handle(useSWR(['config'], getConfiguration))

export const updateConfiguration = (
  update: ConfigUpdate,
): Promise<ConfigView> =>
  createClient()
    .PATCH('/config', { body: update })
    .then(throw_it)
    .then(require_data)

export const useMeta = make_get('meta', id =>
  useClient().GET('/meta/{id}', { params: { path: { id } } })
)

// useMetaSeason: (season?: YearSeason) =>  make_inf('meta-season', ([,cursor]) => client().GET('/meta/season', )),
export const useMetaList = make_inf('meta', ([, cursor]) =>
  useClient().GET('/meta', { params: { query: { cursor } } })
)

export const useMetaGroup = make_get('meta-group', id => {
  return useClient().GET('/meta/{id}/group', { params: { path: { id } } })
})

export const useMetaEntries = make_inf_with_id('meta-entry', ([, id, cursor]) =>
  useClient().GET('/meta/{id}/entry', {
    params: { path: { id }, query: { cursor } }
  })
)

export const useMetaAlias = make_inf_with_id('meta-alias', ([, id, cursor]) =>
  useClient().GET('/meta/{id}/alias', {
    params: { path: { id }, query: { cursor } }
  })
)

export const useMetaSubs = make_inf_with_id(
  'meta-subscription',
  ([, id, cursor]) =>
    useClient().GET('/meta/{id}/subscription', {
      params: { path: { id }, query: { cursor } }
    })
)

export const useMetaSeason = (year?: number, season?: Season) =>
  handle(
    useSWR(['season', year, season], () =>
      useClient()
        .GET('/meta/season', { params: { query: { year, season } } })
        .then(throw_it)
    )
  )

export const useSubscriptionSeason = (year?: number, season?: Season) =>
  handle(
    useSWR(['subscription-season', year, season], () =>
      useClient()
        .GET('/meta/subscription', { params: { query: { year, season } } })
        .then(throw_it)
    ),
  )

export const useRefreshSubscriptionData = () => {
  const { mutate } = useSWRConfig()
  return () =>
    mutate(
      (key) =>
        Array.isArray(key) &&
        (key[0] === 'season' || key[0] === 'subscription-season'),
    )
}

export const useExtractedMeta = (id: string): Ret<ExtractedMeta> =>
  map(useMeta(id), extract_meta)

export const useExtractedEntry = (id: string): Ret<ExtractedEntry> =>
  map(useEntry(id), extract_entry)

export const useDownload = make_get('download', id =>
  useClient().GET('/download/{id}', { params: { path: { id } } })
)

export const useDownloadList = make_inf('download', ([, cursor]) =>
  useClient().GET('/download', { params: { query: { cursor } } })
)

export const useEntry = make_get('entry', id =>
  useClient().GET('/entry/{id}', { params: { path: { id } } })
)

export const useEntryList = make_inf('entry', ([, cursor]) =>
  useClient().GET('/entry', { params: { query: { cursor } } })
)

export const useSearchSuggestions = (query: string) => {
  const enabled = is_search_query(query)
  const response = useSWR(
    enabled ? ['search-suggestions', query] : null,
    () =>
      useClient()
        .GET('/search/suggestions', { params: { query: { q: query } } })
        .then(throw_it)
        .then(require_data),
  )
  return enabled
    ? handle(response)
    : {
        data: undefined,
        isLoading: false as const,
        error: null,
        mutate: response.mutate,
      }
}

export const useSearch = (query: string) => {
  const enabled = is_search_query(query)
  const response = useSWR(
    enabled ? ['search', query] : null,
    () =>
      useClient()
        .GET('/search', { params: { query: { q: query } } })
        .then(throw_it)
        .then(require_data),
  )
  return enabled
    ? handle(response)
    : {
        data: undefined,
        isLoading: false as const,
        error: null,
        mutate: response.mutate,
      }
}

export const getSearchSection = (
  query: string,
  section: SearchSection,
  cursor?: string,
): Promise<SearchResult> =>
  useClient()
    .GET('/search', {
      params: { query: { q: query, section, cursor } },
    })
    .then(throw_it)
    .then(require_data)

type SearchEntryKey = [
  resource: string,
  metaId: string,
  query: string,
  cursor?: string,
]

export const useSearchMetaEntries = (metaId: string, query: string) =>
  useSWRInfinite(
    (index: number, previous: SearchEntryPage | undefined): SearchEntryKey | null => {
      if (!is_search_query(query)) return null
      if (index === 0) return ['search-meta-entry', metaId, query]
      return previous?.next_cursor
        ? ['search-meta-entry', metaId, query, previous.next_cursor]
        : null
    },
    ([, id, q, cursor]: SearchEntryKey) =>
      useClient()
        .GET('/search/meta/{id}/entry', {
          params: { path: { id }, query: { q, cursor } },
        })
        .then(throw_it)
        .then(require_data),
  )
