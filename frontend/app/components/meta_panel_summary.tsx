import { Link } from '@remix-run/react'
import { extract_meta } from 'app/util'
import Icon from 'app/ui/icon'
import {
  getSeasonFromDate,
  getSeasonName,
} from 'app/components/season_selector'
import type { Meta, WithId } from 'forrit-client'
import type { ReactNode } from 'react'

export default function MetaPanelSummary({
  children,
  controls,
  meta: source,
  showCalendarSeason = false,
  title,
}: {
  children?: ReactNode
  controls?: ReactNode
  meta: WithId<Meta>
  showCalendarSeason?: boolean
  title?: ReactNode
}) {
  const meta = extract_meta(source)
  const release =
    showCalendarSeason && source.begin
      ? getSeasonFromDate(new Date(source.begin))
      : null
  const releaseName = release ? getSeasonName(release.season) : null
  const releaseLabel =
    release && releaseName ? `${release.year}${releaseName}` : null

  return (
    <>
      <Link
        aria-label={`查看 ${meta.title}`}
        className="hidden overflow-hidden bg-background sm:block"
        to={`/meta/${meta.id}`}
      >
        {meta.poster ? (
          <img alt="" className="h-auto w-full" src={meta.poster} />
        ) : (
          <span className="grid aspect-[2/3] w-full place-items-center text-muted">
            <Icon className="text-2xl" name="fileVideo" />
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              className="flex items-baseline gap-2 text-lg font-600 text-text no-underline hover:text-accent hover:underline"
              to={`/meta/${meta.id}`}
            >
              <span className="min-w-0 truncate">{title ?? meta.title}</span>
              {releaseLabel ? (
                <span className="shrink-0 text-sm font-400 text-muted">
                  ({releaseLabel})
                </span>
              ) : null}
            </Link>
            {meta.info.length ? (
              <p className="mb-0 mt-1 text-sm text-muted">
                {meta.info.map(item => item.content).join(' | ')}
              </p>
            ) : null}
          </div>
          {controls ? <div className="flex shrink-0 gap-1">{controls}</div> : null}
        </div>
        {children}
      </div>
    </>
  )
}
