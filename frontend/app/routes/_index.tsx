import { json, type MetaFunction } from '@remix-run/node'
import {
  type ParsedBroadcast,
  format_day,
  get_endpoint,
  group_by,
  parse_broadcast,
  sort_day,
} from '../util'
import type { Meta, WithId } from 'forrit-client'
import { Await } from '@remix-run/react'
import { Suspense } from 'react'
import {
  Anchor,
  CardGroup,
  Col,
  Divider,
  Row,
  Typography,
} from '@douyinfe/semi-ui'
import MetaCard from '../components/meta_card'

import data from '../../../data/season.json'

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

const get_container = () => {
  return document.querySelector('window') as unknown as Window
}

export default function Index() {
  const anchor = (
    <Anchor
      getContainer={get_container}
      style={{
        position: 'fixed',
        right: '0',
        top: '100px',
        width: '200px',
        zIndex: 3,
      }}
    >
      <Anchor.Link href='#基本示例' title='基本示例' />
      <Anchor.Link href='#组件' title='组件' />
      <Anchor.Link href='#设计语言' title='设计语言' />
      <Anchor.Link href='#物料平台' title='物料平台' />
      <Anchor.Link href='#主题商店' title='主题商店' />
    </Anchor>
  )
  const season: WithId<
    Meta & {
      parsed_broadcast: ParsedBroadcast | Record<string, never>
    }
  >[] = (data as unknown as WithId<Meta>[])
    .filter(m => !!m.tv && !!m.broadcast)
    .map(m => ({
      ...m,
      parsed_broadcast: parse_broadcast(m.broadcast as string),
    }))
  return (
    <Suspense fallback={<>Loading</>}>
      <Await resolve={season}>
        {bangumi => {
          const grouped = [
            ...group_by(bangumi, m => m.parsed_broadcast.begin.getDay()),
          ].sort(([a], [b]) => sort_day(a, b))

          return (
            <div className='grid'>
              {grouped.map(([day, meta]) => (
                <div key={day} style={{}}>
                  <Row>
                    <Divider
                      margin='1em'
                      style={{
                        marginBottom: '2em',
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
                      xs: 4,
                      sm: 8,
                      md: 12,
                      lg: 24,
                    }}
                  >
                    {meta
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
                </div>
              ))}
            </div>
          )
        }}
      </Await>
    </Suspense>
  )
}
