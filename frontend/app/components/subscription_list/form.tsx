import type { Subscription } from 'forrit-client'

export default function SubscriptionForm({
  init,
  disabled,
}: {
  init: Subscription
  disabled: boolean
}) {
  return (
    <form className="grid grid-cols-2 gap-2 p-2 text-xs">
      <Field
        defaultValue={init.directory ?? ''}
        disabled={disabled}
        label="目录"
        name="directory"
      />
      <Field
        defaultValue={init.min_size ?? ''}
        disabled={disabled}
        label="最小"
        name="min_size"
        type="number"
      />
      <Field
        className="col-span-2"
        defaultValue={init.include ?? ''}
        disabled={disabled}
        label="包含正则"
        name="include"
      />
      <Field
        className="col-span-2"
        defaultValue={init.exclude ?? ''}
        disabled={disabled}
        label="排除正则"
        name="exclude"
      />
      <Field
        defaultValue={init.max_size ?? ''}
        disabled={disabled}
        label="最大"
        name="max_size"
        type="number"
      />
    </form>
  )
}

function Field({
  className = '',
  label,
  ...props
}: {
  className?: string
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`grid gap-1 text-muted ${className}`}>
      {label}
      <input
        className="ui-focus h-8 min-w-0 rounded-md border border-edge bg-surface px-2 text-text disabled:bg-background"
        {...props}
      />
    </label>
  )
}
