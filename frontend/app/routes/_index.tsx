import type { LinksFunction } from '@remix-run/node'
import type { MetaFunction } from '@remix-run/react'
import { useMetaSeason } from 'app/client'
import Loading from 'app/components/loading'
import MetaCard, { metaCardWidth } from 'app/components/meta_card'
import PageHeader from 'app/components/page_header'
import WidthLimit from 'app/components/width_limit'
import type { Meta, Season, WithId } from 'forrit-client'
import { group, listify } from 'radash'
import { Fragment, useState } from 'react'
import { format_day, parse_broadcast, sort_day } from '../util'

export const meta: MetaFunction = () => [
  { title: 'Forrit' },
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

const seasons: { value: Season; label: string }[] = [
  { value: 'winter', label: '1月番' },
  { value: 'spring', label: '4月番' },
  { value: 'summer', label: '7月番' },
  { value: 'fall', label: '10月番' },
]

export default function Index() {
  const startYear = 1943
  const currentYear = new Date().getFullYear()
  const currentMonth = Math.floor((new Date().getMonth() + 1) / 3)
  const currentSeason = seasons[currentMonth].value
  const [season, setSeason] = useState<Season>(currentSeason)
  const [year, setYear] = useState(currentYear)
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => index + startYear,
  ).reverse()

  return (
    <>
      <PageHeader routes={[{ href: '/', name: '首页' }, { name: '本季新番' }]}>
        <h1 className="mb-8 mt-16 text-4xl font-600 text-[rgb(28_31_35/80%)]">
          {season === currentSeason && year === currentYear
            ? '本季新番'
            : `${year}年${seasons.find((item) => item.value === season)?.label}`}
        </h1>
        <div className="grid w-full max-w-92 grid-cols-2 gap-3">
          <label>
            <span className="sr-only">年</span>
            <select
              className="ui-focus h-10 w-full cursor-pointer rounded-md border-0 bg-background px-3 text-text"
              onChange={(event) => setYear(Number(event.currentTarget.value))}
              value={year}
            >
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">季</span>
            <select
              className="ui-focus h-10 w-full cursor-pointer rounded-md border-0 bg-background px-3 text-text"
              onChange={(event) =>
                setSeason(event.currentTarget.value as Season)
              }
              value={season}
            >
              {seasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PageHeader>
      <Loading size="large" useData={() => useMetaSeason(year, season)}>
        {(data) => <Loaded data={data} />}
      </Loading>
    </>
  )
}

function Loaded({ data }: { data: WithId<Meta>[] }) {
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

  return (
    <WidthLimit maxWidth={metaCardWidth * 6 + 20 * 5}>
      {byDay.map(({ day, bangumis }) => (
        <Fragment key={day}>
          <div className="my-10 flex items-center gap-4">
            <span className="h-px flex-1 bg-edge" />
            <h2 className="m-0 text-lg font-500">星期{format_day(day)}</h2>
            <span className="h-px flex-1 bg-edge" />
          </div>
          <div className="grid grid-cols-2 justify-items-center gap-5 sm:grid-cols-[repeat(2,280px)] sm:justify-center lg:grid-cols-[repeat(3,280px)] xl:grid-cols-[repeat(4,280px)] 2xl:grid-cols-[repeat(5,280px)]">
            {bangumis
              ?.sort(
                (first, second) =>
                  +first.parsed_broadcast.begin -
                  +second.parsed_broadcast.begin,
              )
              .map((item) => (
                <MetaCard key={item._id.$oid} meta={item} />
              ))}
          </div>
        </Fragment>
      ))}
    </WidthLimit>
  )
}
