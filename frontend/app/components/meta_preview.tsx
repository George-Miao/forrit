import { Card } from '@douyinfe/semi-ui'
import { Await } from '@remix-run/react'
import { MetaClient } from 'forrit-client'
import { Suspense } from 'react'

import { format_broadcast, get_title, parse_broadcast } from '../util'

export default function MetaPreview({ id }: { id?: string }) {
  if (!id) return <Card>未知</Card>

  const load = new MetaClient('http://localhost:8081').get(id)

  return (
    <Suspense>
      <Await resolve={load}>
        {meta => {
          console.log(meta)
          // const season =
          //   meta.season_override?.number ?? meta.season?.season_number
          // const season_comp = (
          //   <p style={{ marginRight: 10, fontSize: 18 }}>
          //     {season ? `S${season}` : ''}
          //   </p>
          // )
          const cover = meta.tv?.backdrop_path ? (
            <img
              height={169}
              alt='backdrop'
              src={`https://image.tmdb.org/t/p/original/${meta.tv.backdrop_path}`}
            />
          ) : null
          const interval = meta.broadcast ? parse_broadcast(meta.broadcast) : {}

          return (
            <Card style={{ maxWidth: 300 }} cover={cover}>
              <Card.Meta
                title={get_title(meta)}
                description={format_broadcast(interval)}
                // avatar={season_comp}
              />
            </Card>
          )
        }}
      </Await>
    </Suspense>
  )
}
