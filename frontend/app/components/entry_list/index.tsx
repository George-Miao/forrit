import type { PartialEntry, WithId } from 'forrit-client'
import { List, Typography } from '@douyinfe/semi-ui'
import { use_is_md } from 'app/util'

import EntryListItem from './item'
import './index.css'

const { Text, Title } = Typography

const extract = (entry: WithId<PartialEntry>) => {
  return {
    ...entry,
    id: entry._id.$oid,
    episode: entry.elements.EpisodeNumber,
    pub_date: entry.pub_date ? new Date(entry.pub_date) : null,
    elements: entry.elements,
  }
}

export type ExtractedEntry = ReturnType<typeof extract>

export interface EntryListProps {
  show_meta?: boolean
  data: WithId<PartialEntry>[]
}

export default function EntryList({ data, show_meta }: EntryListProps) {
  show_meta = show_meta ?? false
  const is_md = use_is_md()
  return (
    <List
      style={{ width: '100%' }}
      dataSource={data.map(extract)}
      emptyContent={
        <Text
          type='tertiary'
          style={{
            display: 'block',
            marginTop: '2em',
          }}
        >
          暂无资源
        </Text>
      }
      renderItem={item => (
        <EntryListItem
          key={item._id.$oid}
          item={item}
          is_md={is_md}
          show_meta={show_meta}
        />
      )}
    />
  )
}
