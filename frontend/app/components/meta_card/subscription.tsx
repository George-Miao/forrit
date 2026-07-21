import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Dialog } from '@base-ui/react/dialog'
import { Menu } from '@base-ui/react/menu'
import { useClient, useMetaGroup } from 'app/client'
import Button from 'app/ui/button'
import Icon from 'app/ui/icon'
import { notify } from 'app/ui/toast'
import type { Subscription } from 'forrit-client'
import { OrderedSet } from 'immutable'
import { isEqual } from 'radash'
import { useState } from 'react'
import Loading from '../loading'

const isEmpty = (subscription: Subscription | null) => {
  if (!subscription) return true
  const { groups, ...rest } = subscription
  return (
    groups.length === 0 && Object.values(rest).every((value) => value === null)
  )
}

interface SubscribeButtonProps {
  show_text: boolean
  meta_id: string
  subscription: Subscription | null
}

export default function SubscribeButton({
  show_text: showText,
  meta_id: metaId,
  subscription,
}: SubscribeButtonProps) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [current, setCurrent] = useState(subscription)
  const selected = Array.isArray(current?.groups)
    ? OrderedSet(current.groups)
    : OrderedSet<string>()
  const subscribesToAll = current?.groups === 'all'
  const subscribesTo = (group: string) => subscribesToAll || selected.has(group)
  const client = useClient()

  const remove = async () => {
    const previous = window.structuredClone(current)
    setCurrent(null)
    const response = await client.DELETE('/meta/{id}/subscription', {
      params: { path: { id: metaId } },
      headers: { Accept: 'application/json' },
    })
    if (response.error) {
      setCurrent(previous)
      notify('删除订阅失败', response.error)
    }
  }

  const update = async (
    callback: (value: Subscription | null) => Subscription,
  ) => {
    const previous = window.structuredClone(current)
    const next = callback(previous)
    if (isEqual(previous, next)) return
    if (isEmpty(next)) {
      await remove()
      return
    }

    setCurrent(next)
    const response = await client.PUT('/meta/{id}/subscription', {
      params: { path: { id: metaId } },
      body: next,
      headers: { Accept: 'application/json' },
    })
    if (response.error) {
      setCurrent(previous)
      notify('更新订阅失败', response.error)
    }
  }

  const menuItem =
    'ui-focus flex w-full cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent px-3 py-2 text-left transition hover:bg-[rgb(28_31_35/8%)] data-highlighted:bg-[rgb(28_31_35/8%)] active:scale-[0.98] active:bg-accent-soft data-disabled:cursor-not-allowed data-disabled:opacity-45'

  return (
    <>
      <Menu.Root modal={false}>
        <Menu.Trigger
          render={
            <Button
              aria-label={current ? '编辑订阅' : '订阅'}
              className={showText ? '' : 'h-9 w-9 shrink-0 p-0'}
              variant="ghost"
            />
          }
        >
          <Icon name={current ? 'check' : 'plus'} />
          {showText ? (current ? '已订阅' : '订阅') : null}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner
            align="end"
            className="z-300 outline-none"
            sideOffset={28}
          >
            <Menu.Popup className="ui-popup min-w-44 overflow-hidden p-1">
              <Loading
                spinStyle={{ margin: '1.5rem auto' }}
                useData={() => useMetaGroup(metaId)}
              >
                {(groups) => (
                  <>
                    {groups.length ? (
                      <Menu.Group>
                        <Menu.GroupLabel className="px-3 py-1 text-xs font-600 text-muted">
                          字幕组
                        </Menu.GroupLabel>
                        {groups.map((group) => (
                          <Menu.Item
                            className={menuItem}
                            disabled={subscribesToAll}
                            key={group}
                            nativeButton
                            onClick={() =>
                              void update((value) => ({
                                ...value,
                                groups: subscribesTo(group)
                                  ? selected.remove(group).toArray()
                                  : selected.add(group).toArray(),
                                }))
                            }
                            render={<button type="button" />}
                          >
                            <Icon
                              className={
                                subscribesTo(group)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              }
                              name="check"
                            />
                            {group}
                          </Menu.Item>
                        ))}
                      </Menu.Group>
                    ) : null}
                    {groups.length ? (
                      <Menu.Separator className="my-1 h-px bg-edge" />
                    ) : null}
                    <Menu.Item
                      className={menuItem}
                      nativeButton
                      onClick={() =>
                        void update((value) => ({
                          ...value,
                          groups: subscribesToAll ? [] : 'all',
                        }))
                      }
                      render={<button type="button" />}
                    >
                      <Icon
                        className={
                          subscribesToAll ? 'opacity-100' : 'opacity-0'
                        }
                        name="check"
                      />
                      订阅全部
                    </Menu.Item>
                    <Menu.Separator className="my-1 h-px bg-edge" />
                    <div className="grid grid-cols-2 gap-1">
                      <Menu.Item
                        className={`${menuItem} justify-center`}
                        nativeButton
                        onClick={() => setEditing(true)}
                        render={<button type="button" />}
                      >
                        <Icon name="edit" />
                        编辑
                      </Menu.Item>
                      <Menu.Item
                        className={`${menuItem} justify-center text-danger`}
                        disabled={!current}
                        nativeButton
                        onClick={() => setConfirming(true)}
                        render={<button type="button" />}
                      >
                        <Icon name="trash" />
                        删除
                      </Menu.Item>
                    </div>
                  </>
                )}
              </Loading>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <SubscriptionEditDialog
        current={current}
        onOpenChange={setEditing}
        onSave={(advanced) =>
          update((value) => ({ groups: value?.groups ?? [], ...advanced }))
        }
        open={editing}
      />
      <AlertDialog.Root open={confirming} onOpenChange={setConfirming}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-100 bg-black/30" />
          <AlertDialog.Viewport className="fixed inset-0 z-101 grid place-items-center p-4">
            <AlertDialog.Popup className="ui-panel w-full max-w-sm p-6">
              <AlertDialog.Title className="m-0 text-lg font-600">
                删除订阅？
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm text-muted">
                这个操作会移除该番剧的订阅设置。
              </AlertDialog.Description>
              <div className="mt-6 flex justify-end gap-2">
                <AlertDialog.Close render={<Button variant="ghost" />}>
                  取消
                </AlertDialog.Close>
                <AlertDialog.Close
                  render={
                    <Button onClick={() => void remove()} variant="danger" />
                  }
                >
                  删除
                </AlertDialog.Close>
              </div>
            </AlertDialog.Popup>
          </AlertDialog.Viewport>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}

type Advanced = Omit<Subscription, 'groups'>

function SubscriptionEditDialog({
  open,
  onOpenChange,
  current,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  current: Subscription | null
  onSave: (subscription: Advanced) => Promise<unknown>
}) {
  const [error, setError] = useState('')

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-100 bg-black/30" />
        <Dialog.Viewport className="fixed inset-0 z-101 grid place-items-center overflow-y-auto p-4">
          <Dialog.Popup className="ui-panel w-full max-w-lg p-6">
            <Dialog.Title className="m-0 text-xl font-600">
              编辑订阅
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted">
              设置下载目录和资源过滤规则。
            </Dialog.Description>
            <form
              className="mt-6 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                const data = new FormData(event.currentTarget)
                const include = String(data.get('include') || '')
                const exclude = String(data.get('exclude') || '')
                try {
                  if (include) new RegExp(include)
                  if (exclude) new RegExp(exclude)
                } catch {
                  setError('正则表达式无效')
                  return
                }
                setError('')
                void onSave({
                  directory: String(data.get('directory') || '') || null,
                  exclude: exclude || null,
                  include: include || null,
                  max_size: Number(data.get('max_size')) || null,
                  min_size: Number(data.get('min_size')) || null,
                }).then(() => onOpenChange(false))
              }}
            >
              <Field
                defaultValue={current?.directory ?? ''}
                label="保存目录"
                name="directory"
                placeholder="下载路径"
              />
              <Field
                defaultValue={current?.include ?? ''}
                label="包含正则"
                name="include"
                placeholder="用于保留匹配的条目"
              />
              <Field
                defaultValue={current?.exclude ?? ''}
                label="排除正则"
                name="exclude"
                placeholder="用于过滤匹配的条目"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  defaultValue={current?.min_size ?? ''}
                  label="最小文件大小"
                  name="min_size"
                  type="number"
                />
                <Field
                  defaultValue={current?.max_size ?? ''}
                  label="最大文件大小"
                  name="max_size"
                  type="number"
                />
              </div>
              {error ? (
                <p className="m-0 text-sm text-danger">{error}</p>
              ) : null}
              <div className="mt-2 flex justify-end gap-2">
                <Dialog.Close render={<Button variant="ghost" />}>
                  取消
                </Dialog.Close>
                <Button type="submit" variant="primary">
                  保存
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5 text-sm font-500">
      {label}
      <input
        className="ui-focus h-10 rounded-lg border border-edge bg-surface px-3 font-400"
        {...props}
      />
    </label>
  )
}
