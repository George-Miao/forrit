import { format_broadcast, get_title, parse_broadcast } from 'app/util'
import type { Meta, WithId } from 'forrit-client'
import Poster from '../blurry_image'
import SubscribeButton from './subscription'

export const metaCardWidth = 280

export default function MetaCard({
  meta,
  subscriptionEditHref,
}: {
  meta: WithId<Meta>
  subscriptionEditHref: string
}) {
  const interval = meta.broadcast ? parse_broadcast(meta.broadcast) : {}

  return (
    <article className="w-[calc((100dvw-3.25rem)/2)] overflow-hidden rounded-md bg-surface shadow-[var(--shadow-card)] sm:w-70">
      {meta.tv?.poster_path ? (
        <a className="block" href={`/meta/${meta._id.$oid}`}>
          <Poster
            alt="番剧封面"
            containerClassName="aspect-[2/3] w-full"
            height="auto"
            poster_path={meta.tv.poster_path as string}
            width="100%"
          />
        </a>
      ) : null}
      <div className="flex items-center justify-between gap-2 p-[15px]">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-sm font-500" title={get_title(meta)}>
            {get_title(meta)}
          </h3>
          <p className="mb-0 mt-1 text-sm text-muted">
            {format_broadcast(interval)}
          </p>
        </div>
        <SubscribeButton
          editHref={subscriptionEditHref}
          meta_id={meta._id.$oid}
          style="icon-only"
          subscription={meta.subscription ?? null}
        />
      </div>
    </article>
  )
}
