import type { Alias } from './bindings/Alias'
import type { Job } from './bindings/Job'
import type { Meta } from './bindings/Meta'
import type { PartialEntry } from './bindings/PartialEntry'
import type { Subscription } from './bindings/Subscription'
import type { UpdateResult } from './bindings/UpdateResult'
import type { WithId } from './bindings/WithId'
import type { YearSeason } from './bindings/YearSeason'

export type { Alias } from './bindings/Alias'
export type { Broadcast } from './bindings/Broadcast'
export type { Entry } from './bindings/Entry'
export type { EntryBase } from './bindings/EntryBase'
export type { IndexArg } from './bindings/IndexArg'
export type { IndexStat } from './bindings/IndexStat'
export type { ItemType } from './bindings/ItemType'
export type { Job } from './bindings/Job'
export type { Language } from './bindings/Language'
export type { Meta } from './bindings/Meta'
export type { ObjectId } from './bindings/ObjectId'
export type { PartialEntry } from './bindings/PartialEntry'
export type { Record } from './bindings/Record'
export type { SeasonOverride } from './bindings/SeasonOverride'
export type { SeasonShort } from './bindings/SeasonShort'
export type { Site } from './bindings/Site'
export type { Subscription } from './bindings/Subscription'
export type { TVShowShort } from './bindings/TVShowShort'
export type { UpdateResult } from './bindings/UpdateResult'
export type { WithId } from './bindings/WithId'
export type { YearMonth } from './bindings/YearMonth'
export type { YearSeason } from './bindings/YearSeason'

interface ReqArg<B = undefined> {
  id?: string
  body?: B
  param?: { [key: string]: string }
}

abstract class Client {
  protected endpoint: string
  protected resource: () => string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  private get_req<T>(method: string, arg: ReqArg<T>): Request {
    const url = new URL(`${this.resource()}/${arg.id ?? ''}`, this.endpoint)
    if (arg.param) {
      for (const val in Object.entries(arg.param)) {
        url.searchParams.append(val[0], val[1])
      }
    }
    return new Request(url, {
      method,
      body: arg.body ? JSON.stringify(arg.body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  }

  protected async request<T, B = undefined>(
    method: string,
    arg?: ReqArg<B> | undefined,
  ): Promise<T> {
    const req = this.get_req(method, arg ?? {})
    return await fetch(req).then(r => r.json())
  }
}

function list<T>(this: Client): Promise<WithId<T>[]> {
  return this.request('GET')
}

function create<T>(this: Client, body: T): Promise<string> {
  return this.request('POST', { body })
}

function get<T>(this: Client, id: string): Promise<WithId<T>> {
  return this.request('GET', { id })
}

function update<T>(this: Client, id: string, body: T): Promise<UpdateResult> {
  return this.request<UpdateResult, T>('PUT', { id, body })
}

function del<T>(this: Client, id: string): Promise<WithId<T>> {
  return this.request('DELETE', { id })
}

// These should correspond to api declared in forrit_server::api::run
export class EntryClient extends Client {
  resource = () => 'entry'
  list = list<PartialEntry>
  get = get<PartialEntry>
  update = update<PartialEntry>
  delete = del<PartialEntry>
}

export class MetaClient extends Client {
  resource = () => 'meta'
  list = list<Meta>
  get = get<Meta>
  update = update<Meta>
  get_by_season = (season?: YearSeason) =>
    this.request<WithId<Meta>[]>('GET', {
      id: 'season',
      param: season
        ? {
            year: `${season.year}`,
            season: season.season,
          }
        : undefined,
    })
}

export class AliasClient extends Client {
  resource = () => 'alias'
  list = list<Alias>
  create = create<Alias>
  get = get<Alias>
  update = update<Alias>
  delete = del<Alias>
}

export class SubscriptionClient extends Client {
  resource = () => 'subscription'
  list = list<Subscription>
  create = create<Subscription>
  get = get<Subscription>
  update = update<Subscription>
  delete = del<Subscription>
}

export class JobClient extends Client {
  resource = () => 'job'
  list = list<Job>
  get = get<Job>
}
