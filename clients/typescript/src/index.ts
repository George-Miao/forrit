import { Alias } from './bindings/Alias'
import { Job } from './bindings/Job'
import { Meta } from './bindings/Meta'
import { ObjectId } from './bindings/ObjectId'
import { PartialEntry } from './bindings/PartialEntry'
import { Subscription } from './bindings/Subscription'
import { UpdateResult } from './bindings/UpdateResult'
import { WithId } from './bindings/WithId'

function impl_resource(resource: string, derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      if (name !== 'constructor') {
        derivedCtor.prototype[name] = baseCtor.prototype[name]
      }
    })
  })
  derivedCtor.prototype.resource = () => resource
}

abstract class Client {
  protected endpoint: string
  protected resource: () => string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  private get_req(method: string, id?: string, body?: any): Request {
    const url = new URL(`${this.resource()}/${id ?? ''}`, this.endpoint)
    return new Request(url, {
      method,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  }

  protected async request<T>(
    method: string,
    id?: string,
    body?: any
  ): Promise<T> {
    const req = this.get_req(method, id, body)
    console.log(req)
    return await fetch(req).then(r => r.json())
  }
}

abstract class List<T> extends Client {
  async list(): Promise<T[]> {
    return this.request('GET')
  }
}

abstract class Create<T> extends Client {
  async create(body: T): Promise<ObjectId> {
    return this.request('POST', null, body)
  }
}

abstract class Read<T> extends Client {
  async get(id: string): Promise<WithId<T>> {
    return this.request('GET', id)
  }
}

abstract class Update<T> extends Client {
  async update(id: string, data: T): Promise<UpdateResult> {
    return this.request('PUT', id, data)
  }
}

abstract class Delete<T> extends Client {
  async delete(id: string): Promise<WithId<T>> {
    return await this.request('DELETE', id)
  }
}

export class EntryClient extends Client {
  list: () => Promise<PartialEntry[]>
  get: (id: string) => Promise<WithId<PartialEntry>>
  update: (id: string, data: PartialEntry) => Promise<UpdateResult>
  delete: (id: string) => Promise<WithId<PartialEntry>>
}

export class MetaClient extends Client {
  list: () => Promise<Meta[]>
  get: (id: string) => Promise<WithId<Meta>>
  update: (id: string, data: Meta) => Promise<UpdateResult>
}

export class AliasClient extends Client {
  list: () => Promise<Alias[]>
  create: (body: Alias) => Promise<ObjectId>
  get: (id: string) => Promise<WithId<Alias>>
  update: (id: string, data: Alias) => Promise<UpdateResult>
  delete: (id: string) => Promise<WithId<Alias>>
}

export class SubscriptionClient extends Client {
  list: () => Promise<Subscription[]>
  create: (body: Subscription) => Promise<ObjectId>
  get: (id: string) => Promise<WithId<Subscription>>
  update: (id: string, data: Subscription) => Promise<UpdateResult>
  delete: (id: string) => Promise<WithId<Subscription>>
}

export class JobClient extends Client {
  list: () => Promise<Job[]>
  get: (id: string) => Promise<WithId<Job>>
}

// These should correspond to api declared in forrit_server::api::run
impl_resource('entry', EntryClient, [List, Read, Update, Delete])
impl_resource('meta', MetaClient, [List, Read, Update])
impl_resource('alias', AliasClient, [List, Create, Read, Update, Delete])
impl_resource('subscription', SubscriptionClient, [
  List,
  Create,
  Read,
  Update,
  Delete
])
impl_resource('job', JobClient, [List, Read])
