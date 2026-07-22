import { Link } from '@remix-run/react'
import { useClient } from 'app/client'
import { extract_meta, formatBytes } from 'app/util'
import Button from 'app/ui/button'
import Icon from 'app/ui/icon'
import { notify } from 'app/ui/toast'
import type { Meta, Subscription, WithId } from 'forrit-client'
import { useEffect, useRef, useState } from 'react'
import SubscriptionForm from './form'

export default function SubscriptionItem({
  editing,
  meta: source,
  onChange,
  onEditingChange,
}: {
  editing: boolean
  meta: WithId<Meta>
  onChange: (id: string, subscription: Subscription | null) => void
  onEditingChange: (id: string | null) => void
}) {
  const meta = extract_meta(source)
  const subscription = source.subscription
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const itemRef = useRef<HTMLElement>(null)
  const scrollToEditingOnMount = useRef(editing)
  const client = useClient()

  useEffect(() => {
    if (editing) setConfirming(false)
  }, [editing])

  useEffect(() => {
    if (scrollToEditingOnMount.current) {
      itemRef.current?.scrollIntoView({ block: 'center' })
    }
  }, [])

  if (!subscription) return null

  const save = async (next: Subscription) => {
    setBusy(true)
    const response = await client.PUT('/meta/{id}/subscription', {
      body: next,
      headers: { Accept: 'application/json' },
      params: { path: { id: meta.id } },
    })
    setBusy(false)
    if (response.error) {
      notify('保存订阅失败', response.error)
      return
    }
    onChange(meta.id, next)
    onEditingChange(null)
  }

  const remove = async () => {
    setBusy(true)
    const response = await client.DELETE('/meta/{id}/subscription', {
      headers: { Accept: 'application/json' },
      params: { path: { id: meta.id } },
    })
    setBusy(false)
    if (response.error) {
      notify('删除订阅失败', response.error)
      return
    }
    onChange(meta.id, null)
    onEditingChange(null)
  }

  return (
    <article
      className="ui-panel grid grid-cols-1 overflow-hidden sm:grid-cols-[7rem_minmax(0,1fr)]"
      ref={itemRef}
    >
      <Link
        aria-label={`查看 ${meta.title}`}
        className="hidden overflow-hidden bg-background sm:block"
        to={`/meta/${meta.id}`}
      >
        {meta.poster ? (
          <img
            alt=""
            className="h-auto w-full"
            src={meta.poster}
          />
        ) : (
          <span className="grid aspect-[2/3] w-full place-items-center text-muted">
            <Icon className="text-2xl" name="fileVideo" />
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                className="block truncate text-lg font-600 text-text no-underline hover:text-accent hover:underline"
                to={`/meta/${meta.id}`}
              >
                {meta.title}
              </Link>
              {meta.info.length ? (
                <p className="mb-0 mt-1 text-sm text-muted">
                  {meta.info.map((item) => item.content).join(' | ')}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                aria-label={`编辑 ${meta.title}`}
                className="h-9 w-9 p-0"
                disabled={busy}
                onClick={() => {
                  setConfirming(false)
                  onEditingChange(editing ? null : meta.id)
                }}
                variant="ghost"
              >
                <Icon name={editing ? 'x' : 'edit'} />
              </Button>
              <Button
                aria-label={`删除 ${meta.title}`}
                className="h-9 w-9 p-0"
                disabled={busy}
                onClick={() => {
                  onEditingChange(null)
                  setConfirming(true)
                }}
                variant="danger"
              >
                <Icon name="trash" />
              </Button>
            </div>
          </div>
          <SubscriptionSummary subscription={subscription} />
      </div>
      {editing ? (
          <div className="col-span-full border-t border-edge bg-background/50 p-4 sm:p-5">
            <SubscriptionForm
              busy={busy}
              init={subscription}
              metaId={meta.id}
              onCancel={() => onEditingChange(null)}
              onSubmit={(next) => void save(next)}
            />
          </div>
      ) : null}
      {confirming ? (
          <div className="col-span-full flex flex-wrap items-center justify-between gap-3 border-t border-edge bg-red-50/60 px-4 py-3 sm:px-5">
            <p className="m-0 text-sm text-danger">确认删除这个订阅？</p>
            <div className="flex gap-2">
              <Button
                disabled={busy}
                onClick={() => setConfirming(false)}
                variant="ghost"
              >
                取消
              </Button>
              <Button
                disabled={busy}
                onClick={() => void remove()}
                variant="danger"
              >
                {busy ? '删除中…' : '确认删除'}
              </Button>
            </div>
          </div>
      ) : null}
    </article>
  )
}

function SubscriptionSummary({ subscription }: { subscription: Subscription }) {
  const details = [
    subscription.groups === 'all'
      ? '全部字幕组'
      : subscription.groups.length
        ? subscription.groups.join('、')
        : null,
    subscription.directory ? `目录 ${subscription.directory}` : null,
    subscription.include ? `包含 ${subscription.include}` : null,
    subscription.exclude ? `排除 ${subscription.exclude}` : null,
    subscription.min_size ? `≥ ${formatBytes(subscription.min_size)}` : null,
    subscription.max_size ? `≤ ${formatBytes(subscription.max_size)}` : null,
  ].filter(Boolean)

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {details.map((detail) => (
        <span
          className="rounded-md bg-background px-2.5 py-1 text-xs text-muted"
          key={detail}
        >
          {detail}
        </span>
      ))}
    </div>
  )
}
