import { Space, Typography } from '@douyinfe/semi-ui'
import { group_by, use_is_md } from 'app/util'
import type { Subscription, WithId } from 'forrit-client'
import Loading from '../loading'
import hooks from 'app/client'
import { useState } from 'react'

import SubscriptionItem from './item'

const { Text } = Typography

const width = 150
const height = 150 * 1.5
const placeholder = `https://placedog.net/${width}/${height}`

export interface SubscriptionListProps {
  data: WithId<Subscription>[]
}

export default function SubscriptionList({ data }: SubscriptionListProps) {
  const [grouped, set_grouped] = useState(group_by(data, x => x.meta_id.$oid))
  const is_md = use_is_md()
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: is_md ? '1fr' : '1fr 1fr',
        gap: '1em',
        marginTop: '1em',
      }}
    >
      {[...grouped.entries()].map(([id, subs]) => (
        <Loading key={id} useData={() => hooks.useExtractedMeta(id)}>
          {meta => {
            return (
              <Space
                spacing={0}
                style={{
                  height,
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid var(--semi-color-border)',
                  borderRadius: 'var(--semi-border-radius-medium)',
                }}
              >
                <img
                  height={height}
                  width={width}
                  src={meta.poster ?? placeholder}
                  alt='poster'
                  style={{
                    borderRadius:
                      'var(--semi-border-radius-medium) 0 0 var(--semi-border-radius-medium)',
                  }}
                />
                <Space
                  vertical
                  spacing={0}
                  align='start'
                  style={{
                    boxSizing: 'border-box',
                    height: '100%',
                    width: 'calc(100% - 100px)',
                  }}
                >
                  <Text
                    strong
                    style={{
                      padding: '1em 1.2em',
                    }}
                    link={{ href: `/meta/${meta._id.$oid}` }}
                  >
                    {meta.title}
                  </Text>
                  <SubscriptionItem
                    key={id}
                    subs={subs}
                    meta_id={id}
                    onAdd={added => {}}
                    onDelete={deleted => {
                      set_grouped(v => {
                        const group = v.get(id)
                        if (!group) return v
                        v.delete(id)
                        if (group.length === 1) return new Map(v)
                        return new Map(
                          v.set(
                            id,
                            group.filter(x => x._id.$oid !== deleted),
                          ),
                        )
                      })
                    }}
                  />
                </Space>
              </Space>
            )
          }}
        </Loading>
      ))}
    </div>
  )
}
