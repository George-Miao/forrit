import { Card } from '@douyinfe/semi-ui'

import { type ExtractedMeta, format_broadcast, parse_broadcast } from '../util'
import { useExtractedMeta } from 'app/client'
import Loading from './loading'

export default function MetaPreview({ meta_id: id }: { meta_id?: string }) {
  if (id) {
    function useData() {
      return useExtractedMeta(id as string)
    }
    return <Loading useData={useData}>{meta => Loaded({ meta: meta })}</Loading>
  }

  return <Card>未知</Card>
}

const width = 200

function Loaded({ meta }: { meta: ExtractedMeta }) {
  const cover = meta.tv?.poster_path ? (
    <a
      style={{
        width: width,
        height: width * 1.5,
      }}
      href={`/meta/${meta.id}`}
    >
      <img
        style={{
          width: '100%',
          height: '100%',
        }}
        alt='poster'
        src={`https://image.tmdb.org/t/p/original/${meta.tv.poster_path}`}
      />
    </a>
  ) : null
  const interval = meta.broadcast ? parse_broadcast(meta.broadcast) : {}

  return (
    <Card
      cover={cover}
      style={{
        maxWidth: width,
      }}
    >
      <Card.Meta title={meta.title} description={format_broadcast(interval)} />
    </Card>
  )
}
