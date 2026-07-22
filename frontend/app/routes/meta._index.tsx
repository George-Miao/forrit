import type { LinksFunction } from '@remix-run/node'
import type { MetaFunction } from '@remix-run/react'
import { useMetaSeason } from 'app/client'
import Loading from 'app/components/loading'
import MetaCard, { metaCardWidth } from 'app/components/meta_card'
import SeasonHeader from 'app/components/season_header'
import { useSeasonQuery } from 'app/components/season_selector'
import WidthLimit from 'app/components/width_limit'
import Icon from 'app/ui/icon'
import type { Meta, Season, WithId } from 'forrit-client'
import { group, listify } from 'radash'
import { Fragment } from 'react'
import { format_day, parse_broadcast, sort_day } from '../util'

export const meta: MetaFunction = () => [
  { title: '番剧 | Forrit' },
  { name: 'description', content: 'Elegant bangumi tracker and downloader' },
]

export const links: LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '96x96',
    href: '/favicon-96x96.png',
  },
  { rel: 'shortcut icon', href: '/favicon.ico' },
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/apple-touch-icon.png',
  },
  { rel: 'manifest', href: '/site.webmanifest' },
]

export default function MetaList() {
  const { season, selectSeason, year } = useSeasonQuery()

  return (
    <>
      <SeasonHeader
        onChange={selectSeason}
        routes={[{ name: '番剧' }]}
        season={season}
        year={year}
      />
      <Loading size="large" useData={() => useMetaSeason(year, season)}>
        {(data) => <Loaded data={data} season={season} year={year} />}
      </Loading>
    </>
  )
}

function Loaded({
  data,
  season,
  year,
}: {
  data: WithId<Meta>[]
  season: Season
  year: number
}) {
  const bangumi = data
    .filter((item) => !!item.tv && !!item.broadcast)
    .map((item) => ({
      ...item,
      parsed_broadcast: parse_broadcast(item.broadcast as string),
    }))
  const byDay = listify(
    group(bangumi, (item) => item.parsed_broadcast.begin.getDay()),
    (day, items) => ({ day, bangumis: items }),
  ).sort((first, second) => sort_day(first.day, second.day))

  if (!byDay.length) {
    return (
      <WidthLimit>
        <div className="grid min-h-72 place-items-center text-center">
          <div>
            <Icon
              className="mx-auto mb-4 text-3xl text-muted"
              name="calendarSearch"
            />
            <h2 className="m-0 text-lg font-600">这个季度还没有番剧</h2>
            <p className="mb-0 mt-2 text-sm text-muted">
              请尝试选择其他季度
            </p>
          </div>
        </div>
      </WidthLimit>
    )
  }

  return (
    <WidthLimit maxWidth={metaCardWidth * 4 + 20 * 3}>
      {byDay.map(({ day, bangumis }) => (
        <Fragment key={day}>
          <div className="my-10 flex items-center gap-4">
            <span className="h-px flex-1 bg-edge" />
            <h2 className="m-0 text-lg font-500">星期{format_day(day)}</h2>
            <span className="h-px flex-1 bg-edge" />
          </div>
          <div className="grid grid-cols-2 justify-items-center gap-5 sm:grid-cols-[repeat(2,280px)] sm:justify-center lg:grid-cols-[repeat(3,280px)] xl:grid-cols-[repeat(4,280px)]">
            {bangumis
              ?.sort(
                (first, second) =>
                  +first.parsed_broadcast.begin -
                  +second.parsed_broadcast.begin,
              )
              .map((item) => (
                <MetaCard
                  key={item._id.$oid}
                  meta={item}
                  subscriptionEditHref={`/subscription?year=${year}&season=${season}&edit=${item._id.$oid}`}
                />
              ))}
          </div>
        </Fragment>
      ))}
    </WidthLimit>
  )
}
