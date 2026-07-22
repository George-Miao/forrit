import { Link, type MetaFunction, useSearchParams } from '@remix-run/react'
import { useSubscriptionSeason } from 'app/client'
import Loading from 'app/components/loading'
import SeasonHeader from 'app/components/season_header'
import { useSeasonQuery } from 'app/components/season_selector'
import SubscriptionList from 'app/components/subscription_list'
import WidthLimit from 'app/components/width_limit'
import Icon from 'app/ui/icon'
import type { Meta, Subscription, WithId } from 'forrit-client'
import { useEffect, useState } from 'react'

export const meta: MetaFunction = () => [{ title: '订阅 | Forrit' }]

export default function SubscriptionPage() {
  const { season, selectSeason, year } = useSeasonQuery()
  const [searchParams, setSearchParams] = useSearchParams()
  const editingId = searchParams.get('edit')
  const setEditingId = (nextId: string | null) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextId) nextParams.set('edit', nextId)
    else nextParams.delete('edit')
    setSearchParams(nextParams, { preventScrollReset: true })
  }

  return (
    <>
      <SeasonHeader
        onChange={selectSeason}
        routes={[{ href: '/meta', name: '番剧' }, { name: '订阅' }]}
        season={season}
        year={year}
      />
      <Loading
        size="large"
        useData={() => useSubscriptionSeason(year, season)}
      >
        {(data) => (
          <Loaded
            data={data}
            editingId={editingId}
            key={`${year}-${season}`}
            onEditingChange={setEditingId}
          />
        )}
      </Loading>
    </>
  )
}

function Loaded({
  data,
  editingId,
  onEditingChange,
}: {
  data: WithId<Meta>[]
  editingId: string | null
  onEditingChange: (id: string | null) => void
}) {
  const [items, setItems] = useState(data)

  useEffect(() => setItems(data), [data])

  const change = (id: string, subscription: Subscription | null) => {
    setItems((currentItems) =>
      subscription
        ? currentItems.map((meta) =>
          meta._id.$oid === id ? { ...meta, subscription } : meta,
        )
        : currentItems.filter((meta) => meta._id.$oid !== id),
    )
  }

  return (
    <WidthLimit className="py-8" maxWidth="920px">
      {items.length ? (
        <>
          <p className="mb-4 mt-0 text-sm text-muted">
            共有 {items.length} 个订阅
          </p>
          <SubscriptionList
            data={items}
            editingId={editingId}
            onChange={change}
            onEditingChange={onEditingChange}
          />
        </>
      ) : (
        <div className="grid min-h-72 place-items-center text-center">
          <div>
            <Icon className="mx-auto mb-4 text-3xl text-muted" name="heart" />
            <h2 className="m-0 text-lg font-600">这个季度还没有订阅</h2>
            <p className="mb-6 mt-2 text-sm text-muted">
              在番剧卡片或详情页中选择字幕组即可添加。
            </p>
            <Link
              className="ui-button ui-focus inline-flex bg-accent text-white no-underline transition hover:brightness-95 active:scale-[0.98]"
              to="/meta"
            >
              浏览番剧
            </Link>
          </div>
        </div>
      )}
    </WidthLimit>
  )
}
