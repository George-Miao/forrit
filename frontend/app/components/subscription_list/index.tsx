import type { Meta, Subscription, WithId } from 'forrit-client'
import SubscriptionItem from './item'

export default function SubscriptionList({
  data,
  editingId,
  onChange,
  onEditingChange,
}: {
  data: WithId<Meta>[]
  editingId?: string | null
  onChange: (id: string, subscription: Subscription | null) => void
  onEditingChange: (id: string | null) => void
}) {
  return (
    <div className="grid gap-4">
      {data.map((meta) => (
        <SubscriptionItem
          editing={meta._id.$oid === editingId}
          key={meta._id.$oid}
          meta={meta}
          onChange={onChange}
          onEditingChange={onEditingChange}
        />
      ))}
    </div>
  )
}
