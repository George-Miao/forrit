import type { paths, ListResult, DirectedCursor, Season } from 'forrit-client'
import create_client, { type FetchResponse } from 'openapi-fetch'
import useSWR, { type KeyedMutator, type SWRResponse } from 'swr'
import { type ExtractedMeta, extract } from './util'
import useSWRInfinite from 'swr/infinite'

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
  x: SWRResponse<T, unknown, unknown>,
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

export const client = () => create_client<paths>({ baseUrl: window.ENV.api })

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

const throw_it = <T, O>(resp: FetchResponse<T, O>) => {
  if (resp.error) throw resp.error
  return resp.data
}

function make_inf<T, O>(
  resource: string,
  req: (key: InfKey) => Promise<FetchResponse<T, O>>,
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

function make_inf_with_id<O, T>(
  resource: string,
  req: (key: IdInfKey) => Promise<FetchResponse<O, T>>,
) {
  return (id: string) =>
    useSWRInfinite(get_key_with_id(id, resource), (key: IdInfKey) =>
      req(key).then(throw_it),
    )
}

function make_get<P, O>(
  resource: string,
  req: (id: string) => Promise<FetchResponse<P, O>>,
) {
  return (id: string) =>
    handle(useSWR([resource, id], ([, id]) => req(id).then(throw_it)))
}

const useMeta = make_get('meta', id =>
  client().GET('/meta/{id}', { params: { path: { id } } }),
)

const hooks = {
  useMeta,
  useMetaList: make_inf('meta', ([, cursor]) =>
    client().GET('/meta', { params: { query: { cursor } } }),
  ),
  // useMetaSeason: (season?: YearSeason) =>  make_inf('meta-season', ([,cursor]) => client().GET('/meta/season', )),
  useMetaEntries: make_inf_with_id('meta-entry', ([, id, cursor]) =>
    client().GET('/meta/{id}/entry', {
      params: { path: { id }, query: { cursor } },
    }),
  ),
  useMetaAlias: make_inf_with_id('meta-alias', ([, id, cursor]) =>
    client().GET('/meta/{id}/alias', {
      params: { path: { id }, query: { cursor } },
    }),
  ),
  useMetaSubs: make_inf_with_id('meta-subscription', ([, id, cursor]) =>
    client().GET('/meta/{id}/subscription', {
      params: { path: { id }, query: { cursor } },
    }),
  ),
  useMetaSeason: (year?: number, season?: Season) =>
    handle(
      useSWR(['season', year, season], () =>
        client()
          .GET('/meta/season', { params: { query: { year, season } } })
          .then(throw_it),
      ),
    ),
  useExtractedMeta: (id: string): Ret<ExtractedMeta> =>
    map(useMeta(id), extract),

  useSub: make_get('subscription', id =>
    client().GET('/subscription/{id}', { params: { path: { id } } }),
  ),
  useSubList: make_inf('subscription', ([, cursor]) =>
    client().GET('/subscription', { params: { query: { cursor } } }),
  ),

  useEntry: make_get('entry', id =>
    client().GET('/entry/{id}', { params: { path: { id } } }),
  ),
  useEntryList: make_inf('entry', ([, cursor]) =>
    client().GET('/entry', { params: { query: { cursor } } }),
  ),
}

export default hooks
