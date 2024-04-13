import { List, Popover, Skeleton } from '@douyinfe/semi-ui'
import { Await, json, useLoaderData } from '@remix-run/react'
import MetaPreview from '../components/meta_preview'
import { Suspense } from 'react'

export const loader = async () => {
  const data = await import('../../../data/entry.json').then(m => m.default)
  return json(data)
}

const skeleton = (
  <Skeleton
    placeholder={
      <div>
        {[...Array(10).keys()].map(i => (
          <Skeleton.Title
            key={i}
            style={{ width: 'full', height: '3em', marginTop: 10 }}
          />
        ))}
      </div>
    }
    loading={true}
  />
)

export default function Entry() {
  const a = useLoaderData<typeof loader>()

  return (
    <Suspense fallback={skeleton}>
      <Await resolve={a}>
        {a => (
          <List
            header={<div>Entries</div>}
            bordered
            dataSource={a}
            renderItem={item => (
              <Popover
                content={<MetaPreview id={item.meta_id?.$oid} />}
                mouseEnterDelay={150}
                mouseLeaveDelay={150}
              >
                <List.Item>
                  <div>{item.title}</div>
                </List.Item>
              </Popover>
            )}
          />
        )}
      </Await>
    </Suspense>
  )
}
