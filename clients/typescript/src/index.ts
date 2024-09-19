import type { components } from './schema'
export type { paths, components } from './schema'

type S = components['schemas']

export type DirectedCursor = S['forrit_core.model.DirectedCursor']
export type EntryBase = S['forrit_core.model.EntryBase']
export type IndexArg = S['forrit_core.model.IndexArg']
export type IndexStat = S['forrit_core.model.IndexStat']
export type Job = S['forrit_core.model.Job']
export type DownloadState = S['forrit_core.model.DownloadState']
export type Meta = S['forrit_core.model.Meta']
export type ObjectId = S['ObjectId']
export type PageInfo = S['forrit_core.model.PageInfo']
export type PartialEntry = S['forrit_core.model.PartialEntry']
export type Season = S['forrit_core.date.Season']
export type Subscription = S['forrit_core.model.Subscription']
export type UpdateResult = S['forrit_core.model.UpdateResult']
export type YearMonth = S['forrit_core.date.YearMonth']

export type ListResult<T> = {
  items: T[]
  page_info: PageInfo
  total_count: number
}

export type WithId<T> = {
  _id: S['ObjectId']
} & T

// export abstract class Client {
//   protected endpoint: string
//   protected resource: () => string

//   constructor(endpoint: string) {
//     this.endpoint = endpoint
//   }

//   private get_req<T>(method: string, arg: ReqArg<T>): Request {
//     const url = new URL(this.resource(), this.endpoint)
//     if (arg.id) {
//       url.pathname += `/${arg.id}`
//     }
//     if (arg.sub_resource) {
//       url.pathname += `/${arg.sub_resource}`
//     }
//     if (arg.param) {
//       // biome-ignore lint/complexity/noForEach:
//       Object.entries(arg.param).forEach(([k, v]) => {
//         v && url.searchParams.append(k, v.toString())
//       })
//     }
//     return new Request(url, {
//       method,
//       body: arg.body ? JSON.stringify(arg.body) : undefined,
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//       },
//     })
//   }

//   protected async request<T, B = undefined>(
//     method: string,
//     arg?: ReqArg<B> | undefined,
//   ): Promise<T> {
//     const req = this.get_req(method, arg ?? {})
//     return await fetch(req).then(r => r.json())
//   }
// }

// const list_subresource = <T>(sub_resource: string) =>
//   function (
//     this: Client,
//     id: string,
//     param?: ListParam,
//   ): Promise<ListResult<WithId<T>>> {
//     return this.request('GET', { id, param, sub_resource })
//   }

// function list<T>(
//   this: Client,
//   param?: ListParam,
// ): Promise<ListResult<WithId<T>>> {
//   return this.request('GET', { param })
// }

// function create<T>(this: Client, body: T): Promise<string> {
//   return this.request('POST', { body })
// }

// function get<T>(this: Client, id: string): Promise<WithId<T>> {
//   return this.request('GET', { id })
// }

// function update<T>(this: Client, id: string, body: T): Promise<UpdateResult> {
//   return this.request<UpdateResult, T>('PUT', { id, body })
// }

// function del<T>(this: Client, id: string): Promise<WithId<T>> {
//   return this.request('DELETE', { id })
// }

// // These should correspond to api declared in forrit_server::api::run
// export class EntryClient extends Client {
//   resource = () => 'entry'
//   list = list<PartialEntry>
//   get = get<PartialEntry>
//   update = update<PartialEntry>
//   delete = del<PartialEntry>
// }

// export class MetaClient extends Client {
//   resource = () => 'meta'
//   list = list<Meta>
//   get = get<Meta>
//   update = update<Meta>

//   list_entry = list_subresource<Entry>('entry')
//   list_alias = list_subresource<Alias>('alias')
//   list_subscription = list_subresource<Subscription>('subscription')

//   get_by_season = (season?: YearSeason) =>
//     this.request<WithId<Meta>[]>('GET', {
//       id: 'season',
//       param: season,
//     })
// }

// export class AliasClient extends Client {
//   resource = () => 'alias'
//   list = list<Alias>
//   create = create<Alias>
//   get = get<Alias>
//   update = update<Alias>
//   delete = del<Alias>
// }

// export class SubscriptionClient extends Client {
//   resource = () => 'subscription'
//   list = list<Subscription>
//   create = create<Subscription>
//   get = get<Subscription>
//   update = update<Subscription>
//   delete = del<Subscription>
// }

// export class DownloadClient extends Client {
//   resource = () => 'download'
//   list = list<Download>
//   get = get<Download>
// }
