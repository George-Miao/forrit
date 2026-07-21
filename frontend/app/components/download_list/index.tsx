import { Link } from '@remix-run/react'
import Hint from 'app/ui/tooltip'
import { format_time_relative, get_date_from_id } from 'app/util'
import type { DownloadState, Job, WithId } from 'forrit-client'

const stateMap: Record<DownloadState, string> = {
  cancelled: '已取消',
  downloading: '下载中',
  failed: '失败',
  finished: '完成',
  pending: '等待中',
}

export default function DownloadItem({ item }: { item: WithId<Job> }) {
  const added = get_date_from_id(item._id.$oid)
  const stateClass =
    item.state === 'failed'
      ? 'text-danger'
      : item.state === 'finished'
        ? 'text-accent'
        : 'text-muted'

  return (
    <article className="w-full py-4">
      <Link
        className="break-all font-400 tracking-tight no-underline hover:underline"
        to={`/entry/${item.entry_id.$oid}`}
      >
        {item.name}
      </Link>
      <div className="mt-1 flex gap-3 text-sm">
        <span className={stateClass}>{stateMap[item.state]}</span>
        <Hint content={added.toLocaleString()}>
          <time className="text-muted" dateTime={added.toISOString()}>
            {format_time_relative(added)}
          </time>
        </Hint>
      </div>
    </article>
  )
}
