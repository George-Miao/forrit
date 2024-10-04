import { Col, Divider, Row, Typography } from '@douyinfe/semi-ui'
import { type MetaFunction, json } from '@remix-run/node'
import { useMetaSeason } from 'app/client'
import Loading from 'app/components/loading'
import MetaCard from 'app/components/meta_card'
import PageHeader from 'app/components/page_header'
import WidthLimit from 'app/components/width_limit'
import type { Meta, WithId } from 'forrit-client'
import { group, listify } from 'radash'
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

export default function Index() {
  return (
    <Loading size='large' useData={useMetaSeason}>
      {data => Loaded(data)}
    </Loading>
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
    (k, v) => ({ day: k, ...v }),
  ).sort((a, b) => sort_day(a.day, b.day))

  return (
    <>
      <PageHeader routes={[{ href: '/', name: '首页' }, { name: '本季新番' }]}>
        <Typography.Title type='secondary' style={{ margin: '2em 0 1em' }}>
          本季新番
        </Typography.Title>
      </PageHeader>
      <WidthLimit maxWidth={230 * 6 + 20 * 5}>
        {by_day.map(([day, bangumis]) => (
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
                .sort(
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
