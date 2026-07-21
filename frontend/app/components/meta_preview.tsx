import { useExtractedMeta } from 'app/client'
import { type ExtractedMeta, format_broadcast, parse_broadcast } from '../util'
import Loading from './loading'

export default function MetaPreview({ meta_id: id }: { meta_id?: string }) {
  if (!id) return <div className="ui-panel p-4">未知</div>
  return (
    <Loading useData={() => useExtractedMeta(id)}>
      {(meta) => <Loaded meta={meta} />}
    </Loading>
  )
}

function Loaded({ meta }: { meta: ExtractedMeta }) {
  const interval = meta.broadcast ? parse_broadcast(meta.broadcast) : {}
  return (
    <article className="w-50 overflow-hidden rounded-lg bg-surface">
      {meta.tv?.poster_path ? (
        <a href={`/meta/${meta.id}`}>
          <img
            alt={`${meta.title} poster`}
            className="h-75 w-full object-cover"
            src={`https://image.tmdb.org/t/p/original/${meta.tv.poster_path}`}
          />
        </a>
      ) : null}
      <div className="p-3">
        <h3 className="m-0 truncate text-sm font-600">{meta.title}</h3>
        <p className="mb-0 mt-1 text-xs text-muted">
          {format_broadcast(interval)}
        </p>
      </div>
    </article>
  )
}
