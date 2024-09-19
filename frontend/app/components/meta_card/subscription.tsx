import Loading from '../loading'
import type { Subscription } from 'forrit-client'
import { useState } from 'react'
import {
  Button,
  ButtonGroup,
  Dropdown,
  Notification,
  Popconfirm,
} from '@douyinfe/semi-ui'
import { useClient, useMetaGroup } from 'app/client'
import { OrderedSet } from 'immutable'
import { IconDelete, IconEdit, IconPlus, IconTick } from '@douyinfe/semi-icons'
import { isEqual } from 'radash'
import './subscription.css'

const isEmpty = (sub: Subscription | null) => {
  if (sub === null) {
    return true
  }

  const { groups, ...rest } = sub

  return groups.length === 0 && Object.values(rest).every(v => v === null)
}

interface SubscribeButtonProps {
  show_text: boolean
  meta_id: string
  subscription: Subscription | null
}

export default function SubscribeButton({
  show_text,
  meta_id,
  subscription,
}: SubscribeButtonProps) {
  const [sub, setSub] = useState(subscription)
  const selected = Array.isArray(sub?.groups)
    ? OrderedSet(sub.groups)
    : OrderedSet<string>()
  const isSubToAll = sub?.groups === 'all'
  const isSubToGroup = (group: string) => isSubToAll || selected.has(group)
  const client = useClient()

  const update =
    (callback: (sub: Subscription | null) => Subscription) => async () => {
      const oldSub = window.structuredClone(sub)
      const newSub = callback(oldSub)
      if (isEqual(oldSub, newSub)) {
        return
      }
      if (isEmpty(newSub)) {
        await remove()
        return
      }

      setSub(newSub)

      await client
        .PUT('/meta/{id}/subscription', {
          params: { path: { id: meta_id } },
          body: newSub,
          headers: { 'Accept': 'application/json' },
        })
        .then(e => {
          if (e.error) {
            setSub(oldSub)
            Notification.error({
              title: '更新订阅失败',
              content: e.error,
            })
          }
        })
    }

  const remove = async () => {
    const oldSub = window.structuredClone(sub)
    setSub(null)
    await client
      .DELETE('/meta/{id}/subscription', {
        params: { path: { id: meta_id } },
        headers: { 'Accept': 'application/json' },
      })
      .then(e => {
        if (e.error) {
          setSub(oldSub)
          Notification.error({
            title: '删除订阅失败',
            content: e.error,
          })
        }
      })
  }

  const SubAll = (
    <Dropdown.Item
      onClick={update(sub =>
        isSubToAll ? { ...sub, groups: [] } : { ...sub, groups: 'all' },
      )}
      active={isSubToAll}
      // style={{
      //   color: isSubToAll
      //     ? 'var(--semi-color-tertiary-active)'
      //     : 'var(--semi-color-tertiary)',
      // }}
    >
      订阅全部
    </Dropdown.Item>
  )

  const Render = () => {
    return (
      <Loading
        useData={() => useMetaGroup(meta_id)}
        spinStyle={{
          width: '3em',
          height: '3em',
          marginTop: 'none',
        }}
      >
        {groups => (
          <Dropdown.Menu>
            {groups.length !== 0 && (
              <>
                <Dropdown.Title>字幕组</Dropdown.Title>
                {groups.map(group => (
                  <Dropdown.Item
                    active={isSubToGroup(group)}
                    key={group}
                    style={{
                      cursor: 'pointer',
                    }}
                    disabled={isSubToAll}
                    onClick={update(curr => ({
                      ...curr,
                      groups: isSubToGroup(group)
                        ? selected.remove(group).toArray()
                        : selected.add(group).toArray(),
                    }))}
                  >
                    {group}
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
              </>
            )}
            {SubAll}
            <Dropdown.Divider />
            <Dropdown.Item type='secondary' className='dropdown-notick'>
              <ButtonGroup
                className='dropdown-button-group'
                style={{
                  display: 'flex',
                  width: '100%',
                }}
              >
                <Button
                  theme='borderless'
                  icon={<IconEdit />}
                  type='tertiary'
                  onClick={() => alert('NOT_IMPLEMENTED')}
                />
                <Popconfirm
                  title='确定是否要删除订阅？'
                  position='bottomRight'
                  onConfirm={remove}
                >
                  <Button
                    disabled={sub === null}
                    theme='borderless'
                    type='danger'
                    icon={<IconDelete />}
                  />
                </Popconfirm>
              </ButtonGroup>
            </Dropdown.Item>
          </Dropdown.Menu>
        )}
      </Loading>
    )
  }

  return (
    <Dropdown
      showTick
      keepDOM
      trigger='click'
      render={<Render />}
      style={{ minWidth: '2em' }}
    >
      <Button
        icon={sub === null ? <IconPlus /> : <IconTick />}
        theme='borderless'
        style={{
          margin: '2px',
          minHeight: '38px',
          // width: show_text ? undefined : '38px',
          minWidth: '38px',
        }}
      >
        {show_text ? (sub === null ? '订阅' : '已订阅') : undefined}
      </Button>
    </Dropdown>
  )
}
