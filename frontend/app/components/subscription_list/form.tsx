import { useMetaGroup } from 'app/client'
import Button from 'app/ui/button'
import MultiSelectMenu from 'app/ui/multi_select_menu'
import type { Subscription } from 'forrit-client'
import { type FormEvent, useState } from 'react'

export default function SubscriptionForm({
  busy,
  init,
  metaId,
  onCancel,
  onSubmit,
}: {
  busy: boolean
  init: Subscription
  metaId: string
  onCancel: () => void
  onSubmit: (subscription: Subscription) => void
}) {
  const [allGroups, setAllGroups] = useState(init.groups === 'all')
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    Array.isArray(init.groups) ? init.groups : [],
  )
  const [validationError, setValidationError] = useState<string | null>(null)
  const groupData = useMetaGroup(metaId)
  const knownGroups = groupData.data ?? []
  const options = [
    ...knownGroups.map((group) => ({
      label: group.name,
      suffix: group.count,
      value: group.name,
    })),
    ...selectedGroups
      .filter((name) => !knownGroups.some((group) => group.name === name))
      .map((name) => ({ label: name, value: name })),
  ]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const optionalString = (name: string) => {
      const value = String(data.get(name) ?? '').trim()
      return value || null
    }
    const optionalNumber = (name: string) => {
      const value = optionalString(name)
      return value === null ? null : Number(value)
    }
    const subscription: Subscription = {
      directory: optionalString('directory'),
      exclude: optionalString('exclude'),
      groups: allGroups ? 'all' : selectedGroups,
      include: optionalString('include'),
      max_size: optionalNumber('max_size'),
      min_size: optionalNumber('min_size'),
    }
    const hasGroups =
      subscription.groups === 'all' || subscription.groups.length > 0
    const hasOtherSetting = [
      subscription.directory,
      subscription.exclude,
      subscription.include,
      subscription.max_size,
      subscription.min_size,
    ].some((value) => value !== null)

    if (!hasGroups && !hasOtherSetting) {
      setValidationError('请至少选择一个字幕组，或填写一项筛选设置。')
      return
    }

    setValidationError(null)
    onSubmit(subscription)
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          defaultValue={init.directory ?? ''}
          label="下载目录"
          name="directory"
          placeholder="使用默认目录"
        />
        <div className="grid gap-1.5 text-sm font-500 text-text">
          <span>字幕组</span>
          <MultiSelectMenu
            exclusiveOption={{
              label: '全部字幕组',
              onSelectedChange: (selected) => {
                setAllGroups(selected)
                if (selected) setSelectedGroups([])
              },
              selected: allGroups,
            }}
            label="选择字幕组"
            onValueChange={setSelectedGroups}
            options={options}
            values={selectedGroups}
          />
        </div>
        <Field
          defaultValue={init.include ?? ''}
          label="包含正则"
          name="include"
          placeholder="例如 1080p|2160p"
        />
        <Field
          defaultValue={init.exclude ?? ''}
          label="排除正则"
          name="exclude"
          placeholder="例如 简日|繁日"
        />
        <Field
          defaultValue={init.min_size ?? ''}
          label="最小文件大小（字节）"
          min="0"
          name="min_size"
          type="number"
        />
        <Field
          defaultValue={init.max_size ?? ''}
          label="最大文件大小（字节）"
          min="0"
          name="max_size"
          type="number"
        />
      </div>
      {validationError ? (
        <p className="m-0 text-sm text-danger" role="alert">
          {validationError}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button disabled={busy} onClick={onCancel} type="button" variant="ghost">
          取消
        </Button>
        <Button disabled={busy} type="submit" variant="primary">
          {busy ? '保存中…' : '保存'}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  ...props
}: {
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5 text-sm font-500 text-text">
      {label}
      <input
        className="ui-focus h-9 min-w-0 rounded-md border border-edge bg-surface px-3 text-sm font-400 text-text placeholder:text-muted/70 disabled:cursor-not-allowed disabled:bg-background"
        {...props}
      />
    </label>
  )
}
