import { json, type MetaFunction } from '@remix-run/node'
import {
  format_day,
  get_endpoint,
  group_by,
  parse_broadcast,
  sort_day,
} from '../util'
import type { Meta, WithId } from 'forrit-client'
import { Col, Divider, Row, Typography } from '@douyinfe/semi-ui'
import MetaCard from 'app/components/meta_card'
import hooks from 'app/client'
import Loading from 'app/components/loading'
import WidthLimit from 'app/components/width_limit'

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
    <Loading size='large' useData={hooks.useMetaSeason}>
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

  const by_day = [
    ...group_by(bangumi, m => m.parsed_broadcast.begin.getDay()),
  ].sort(([a], [b]) => sort_day(a, b))

  return (
    <WidthLimit maxWidth={230 * 6 + 20 * 5}>
      {by_day.map(([day, bangumis]) => (
        <>
          <Row>
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
            gutter={{
              xs: 8,
              sm: 12,
              md: 20,
            }}
          >
            {bangumis
              .sort(
                (a, b) => +a.parsed_broadcast.begin - +b.parsed_broadcast.begin,
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
  )
}
