import { useExtractedMeta } from 'app/client'
import { group_by, use_is_md } from 'app/util'
import type { ObjectId, Subscription, WithId } from 'forrit-client'
import { useState } from 'react'
import Loading from '../loading'
import SubscriptionItem from './item'

const width = 150
const height = 150 * 1.5
const placeholder = `https://placedog.net/${width}/${height}`

export interface SubscriptionListProps {
  data: (WithId<Subscription> & { meta_id: ObjectId })[]
}

export default function SubscriptionList({ data }: SubscriptionListProps) {
  const [grouped, setGrouped] = useState(
    group_by(data, (item) => item.meta_id.$oid),
  )
  const isMedium = use_is_md()

  return (
    <div
      className={`mt-4 grid gap-4 ${isMedium ? 'grid-cols-1' : 'grid-cols-2'}`}
    >
      {[...grouped.entries()].map(([id, subscriptions]) => (
        <Loading key={id} useData={() => useExtractedMeta(id)}>
          {(meta) => (
            <article className="ui-panel flex h-56.25 overflow-hidden">
              <img
                alt={`${meta.title} poster`}
                className="h-full w-37.5 object-cover"
                src={meta.poster ?? placeholder}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <a
                  className="truncate px-5 py-4 font-600 no-underline hover:underline"
                  href={`/meta/${meta._id.$oid}`}
                >
                  {meta.title}
                </a>
                <SubscriptionItem
                  meta_id={id}
                  onAdd={() => {}}
                  onDelete={(deleted) => {
                    setGrouped((value) => {
                      const group = value.get(id)
                      if (!group) return value
                      value.delete(id)
                      if (group.length === 1) return new Map(value)
                      return new Map(
                        value.set(
                          id,
                          group.filter((item) => item._id.$oid !== deleted),
                        ),
                      )
                    })
                  }}
                  subs={subscriptions}
                />
              </div>
            </article>
          )}
        </Loading>
      ))}
    </div>
  )
}
