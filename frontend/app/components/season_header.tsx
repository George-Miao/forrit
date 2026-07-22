import type { Season } from 'forrit-client'
import PageHeader, { type PageRoute } from './page_header'
import SeasonSelector, { getSeasonLabel } from './season_selector'

export default function SeasonHeader({
  onChange,
  routes,
  season,
  year,
}: {
  onChange: (year: number, season: Season) => void
  routes: PageRoute[]
  season: Season
  year: number
}) {
  return (
    <PageHeader routes={routes}>
      <div
        className="flex w-full flex-wrap items-end justify-between gap-6"
        data-season-header
      >
        <div>
          <p className="mb-1 mt-0 font-400 text-muted" data-season-year>
            {year}年
          </p>
          <h1
            className="m-0 text-4xl font-600 text-[rgb(28_31_35/80%)]"
            data-season-label
          >
            {getSeasonLabel(season)}
          </h1>
        </div>
        <SeasonSelector
          onChange={onChange}
          season={season}
          year={year}
        />
      </div>
    </PageHeader>
  )
}
