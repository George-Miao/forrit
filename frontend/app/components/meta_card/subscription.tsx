import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Menu } from '@base-ui/react/menu'
import { useNavigate } from '@remix-run/react'
import {
  useClient,
  useMetaGroup,
  useRefreshSubscriptionData,
} from 'app/client'
import Button from 'app/ui/button'
import Icon from 'app/ui/icon'
import { notify } from 'app/ui/toast'
import type { Subscription } from 'forrit-client'
import { OrderedSet } from 'immutable'
import { isEqual } from 'radash'
import { useRef, useState } from 'react'
import Loading from '../loading'

const isEmpty = (subscription: Subscription | null) => {
  if (!subscription) return true
  const { groups, ...rest } = subscription
  return (
    groups.length === 0 && Object.values(rest).every((value) => value === null)
  )
}

interface SubscribeButtonProps {
  editHref: string
  meta_id: string
  style: 'icon-only' | 'with-text'
  subscription: Subscription | null
}

export default function SubscribeButton({
  editHref,
  meta_id: metaId,
  style,
  subscription,
}: SubscribeButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [current, setCurrent] = useState(subscription)
  const navigate = useNavigate()
  const pendingUpdate = useRef<Promise<void> | null>(null)
  const selected = Array.isArray(current?.groups)
    ? OrderedSet(current.groups)
    : OrderedSet<string>()
  const subscribesToAll = current?.groups === 'all'
  const subscribesTo = (group: string) => subscribesToAll || selected.has(group)
  const showText = style === 'with-text'
  const client = useClient()
  const refreshSubscriptionData = useRefreshSubscriptionData()

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
      return
    }
    await refreshSubscriptionData()
  }

  const update = (
    callback: (value: Subscription | null) => Subscription,
  ) => {
    const operation = (async () => {
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
        return
      }
      await refreshSubscriptionData()
    })()

    pendingUpdate.current = operation
    void operation.finally(() => {
      if (pendingUpdate.current === operation) pendingUpdate.current = null
    })
    return operation
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
          <Icon
            className={!showText && current ? 'text-accent' : ''}
            name={current ? 'check' : 'plus'}
          />
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
                            closeOnClick={false}
                            disabled={subscribesToAll}
                            key={group.name}
                            nativeButton
                            onClick={() =>
                              void update((value) => ({
                                ...value,
                                groups: subscribesTo(group.name)
                                  ? selected.remove(group.name).toArray()
                                  : selected.add(group.name).toArray(),
                                }))
                            }
                            render={<button type="button" />}
                          >
                            <Icon
                              className={
                                subscribesTo(group.name)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              }
                              name="check"
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {group.name}
                            </span>
                            <span
                              aria-label={`${group.count} 个资源`}
                              className="text-xs tabular-nums text-muted"
                            >
                              {group.count}
                            </span>
                          </Menu.Item>
                        ))}
                      </Menu.Group>
                    ) : null}
                    {groups.length ? (
                      <Menu.Separator className="my-1 h-px bg-edge" />
                    ) : null}
                    <Menu.Item
                      className={menuItem}
                      closeOnClick={false}
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
                    {current ? (
                      <>
                        <Menu.Separator className="my-1 h-px bg-edge" />
                        <div className="grid grid-cols-2 gap-1">
                          <Menu.Item
                            className={`${menuItem} justify-center`}
                            nativeButton
                            onClick={() => {
                              void (async () => {
                                await pendingUpdate.current
                                navigate(editHref)
                              })()
                            }}
                            render={<button type="button" />}
                          >
                            <Icon name="edit" />
                            编辑
                          </Menu.Item>
                          <Menu.Item
                            className={`${menuItem} justify-center text-danger`}
                            nativeButton
                            onClick={() => setConfirming(true)}
                            render={<button type="button" />}
                          >
                            <Icon name="trash" />
                            删除
                          </Menu.Item>
                        </div>
                      </>
                    ) : null}
                  </>
                )}
              </Loading>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
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
