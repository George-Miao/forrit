import Button from 'app/ui/button'
import Icon from 'app/ui/icon'
import type { Subscription, WithId } from 'forrit-client'
import { useState } from 'react'
import SubscriptionForm from './form'

export interface SubscriptionItemProps {
  subs: WithId<Subscription>[]
  meta_id: string
  no_padding?: boolean
  onDelete: (id: string) => void
  onAdd: (sub: WithId<Subscription>) => void
}

export default function SubscriptionItem({
  subs,
  no_padding: noPadding = false,
}: SubscriptionItemProps) {
  const [active, setActive] = useState(subs[0]?._id.$oid ?? '')
  const [editing, setEditing] = useState(false)
  const selected = subs.find((item) => item._id.$oid === active)

  return (
    <div className="w-full">
      <div className="flex border-b border-edge">
        <div className="flex flex-1 overflow-x-auto" role="tablist">
          {subs.length ? (
            subs.map((subscription, index) => (
              <button
                aria-selected={active === subscription._id.$oid}
                className={`ui-focus cursor-pointer border-0 border-b-2 bg-transparent px-3 py-2 text-xs transition hover:bg-[rgb(28_31_35/8%)] active:bg-accent-soft ${
                  active === subscription._id.$oid
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted'
                }`}
                key={subscription._id.$oid}
                onClick={() => setActive(subscription._id.$oid)}
                role="tab"
                type="button"
              >
                {index + 1}
              </button>
            ))
          ) : (
            <span className="px-3 py-2 text-xs text-muted">暂无订阅</span>
          )}
        </div>
        <div className="flex p-1">
          {selected ? (
            <>
              <Button
                aria-label={editing ? '保存' : '编辑'}
                className="h-8 w-8 p-0"
                onClick={() => setEditing((value) => !value)}
                variant="ghost"
              >
                <Icon name={editing ? 'save' : 'edit'} />
              </Button>
              <Button
                aria-label="删除"
                className="h-8 w-8 p-0"
                onClick={() => alert('NOT IMPLEMENTED')}
                variant="danger"
              >
                <Icon name="trash" />
              </Button>
            </>
          ) : null}
          <Button
            aria-label="添加"
            className="h-8 w-8 p-0"
            onClick={() => alert('NOT IMPLEMENTED')}
            variant="ghost"
          >
            <Icon name="plus" />
          </Button>
        </div>
      </div>
      {selected ? (
        <div className={noPadding ? '' : 'px-2 py-1'} role="tabpanel">
          <SubscriptionForm disabled={!editing} init={selected} />
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted">暂无订阅</p>
      )}
    </div>
  )
}
