import { Col, Divider, Row, Select, Typography } from '@douyinfe/semi-ui'
import type { OptionProps } from '@douyinfe/semi-ui/lib/es/select'
import { type MetaFunction, json } from '@remix-run/node'
import { useMetaSeason } from 'app/client'
import Loading from 'app/components/loading'
import MetaCard from 'app/components/meta_card'
import PageHeader from 'app/components/page_header'
import WidthLimit from 'app/components/width_limit'
import type { Meta, Season, WithId } from 'forrit-client'
import { group, listify } from 'radash'
import { useState } from 'react'
import { format_day, get_endpoint, parse_broadcast, sort_day } from '../util'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export const loader = async () => {
  return json({
    api: get_endpoint(),
  })
}

const seasons: { value: Season; label: string }[] = [
  { value: 'winter', label: '1月番' },
  { value: 'spring', label: '4月番' },
  { value: 'summer', label: '7月番' },
  { value: 'fall', label: '10月番' },
]

export default function Index() {
  const start_year = 1943
  const current_year = new Date().getFullYear()
  const current_month = Math.floor((new Date().getMonth() + 1) / 3)
  const current_season = seasons[current_month].value

  const [season, set_season] = useState<Season>(current_season)
  const [year, set_year] = useState(current_year)

  const years: OptionProps[] = Array.from(
    { length: current_year - 1943 + 1 },
    (_, x) => x + start_year,
  )
    .map(year => ({
      value: year,
      label: year,
    }))
    .reverse()

  return (
    <>
      <PageHeader routes={[{ href: '/', name: '首页' }, { name: '本季新番' }]}>
        <Typography.Title type='secondary' style={{ margin: '2em 0 1em' }}>
          {season === current_season && year === current_year
            ? '本季新番'
            : `${year}年${seasons.find(s => s.value === season)?.label}`}
        </Typography.Title>
        <Row gutter={12}>
          <Col span={12}>
            <Select
              placeholder='年'
              style={{ width: 180 }}
              value={year}
              onSelect={val => set_year(val as number)}
              optionList={years}
            />
          </Col>
          <Col span={12}>
            <Select
              placeholder='季'
              style={{ width: 180 }}
              value={season}
              onSelect={val => set_season(val as Season)}
              optionList={seasons}
            />
          </Col>
        </Row>
      </PageHeader>
      <Loading size='large' useData={() => useMetaSeason(year, season)}>
        {data => Loaded(data)}
      </Loading>
    </>
  )
}

function Loaded(data: WithId<Meta>[]) {
  const bangumi = data
    .filter(m => !!m.tv && !!m.broadcast)
    .map(m => ({
      ...m,
      parsed_broadcast: parse_broadcast(m.broadcast as string),
    }))

  const by_day = listify(
    group(bangumi, m => m.parsed_broadcast.begin.getDay()),
    (k, v) => ({ day: k, bangumis: v }),
  ).sort((a, b) => sort_day(a.day, b.day))

  return (
    <>
      <WidthLimit maxWidth={230 * 6 + 20 * 5}>
        {by_day.map(({ day, bangumis }) => (
          <>
            <Row key={`header-${day}`}>
              <Divider
                style={{
                  marginTop: '2em',
                  marginBottom: '3em',
                }}
              >
                <Typography.Title
                  heading={4}
                  style={{
                    margin: '0 1em',
                  }}
                >
                  星期{format_day(day)}
                </Typography.Title>
              </Divider>
            </Row>
            <Row
              key={`content-${day}`}
              gutter={{
                xs: 8,
                sm: 12,
                md: 20,
              }}
            >
              {bangumis
                ?.sort(
                  (a, b) =>
                    +a.parsed_broadcast.begin - +b.parsed_broadcast.begin,
                )
                .map(meta => (
                  <Col
                    key={meta._id.$oid}
                    xs={12}
                    md={8}
                    lg={6}
                    xxl={4}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '1em',
                    }}
                  >
                    <MetaCard meta={meta} />
                  </Col>
                ))}
            </Row>
          </>
        ))}
      </WidthLimit>
    </>
  )
}
