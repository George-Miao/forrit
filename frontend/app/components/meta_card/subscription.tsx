import { IconDelete, IconEdit, IconPlus, IconTick } from '@douyinfe/semi-icons'
import {
  Button,
  ButtonGroup,
  Dropdown,
  Form,
  InputGroup,
  Modal,
  Notification,
  Popconfirm,
} from '@douyinfe/semi-ui'
import { useClient, useMetaGroup } from 'app/client'
import { format } from 'bytes'
import type { Subscription } from 'forrit-client'
import { OrderedSet } from 'immutable'
import { isEqual } from 'radash'
import { useState } from 'react'
import Loading from '../loading'
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
  const [editing, setEditing] = useState(false)
  const [sub, setSub] = useState(subscription)
  const selected = Array.isArray(sub?.groups)
    ? OrderedSet(sub.groups)
    : OrderedSet<string>()
  const is_sub_all = sub?.groups === 'all'
  const is_sub_to = (group: string) => is_sub_all || selected.has(group)
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

  const sub_all = (
    <Dropdown.Item
      onClick={update(sub =>
        is_sub_all ? { ...sub, groups: [] } : { ...sub, groups: 'all' },
      )}
      active={is_sub_all}
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
                    active={is_sub_to(group)}
                    key={group}
                    style={{
                      cursor: 'pointer',
                    }}
                    disabled={is_sub_all}
                    onClick={update(curr => ({
                      ...curr,
                      groups: is_sub_to(group)
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
            {sub_all}
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
                  onClick={() => {
                    setEditing(true)
                  }}
                />
                <Modal visible={editing}>123123</Modal>
                <Popconfirm
                  title='确定是否要删除订阅？'
                  position='bottomLeft'
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
    <>
      <Dropdown
        zIndex={500}
        showTick
        keepDOM
        position='bottomRight'
        trigger='click'
        render={<Render />}
        style={{ minWidth: '2em' }}
      >
        <Button
          icon={sub === null ? <IconPlus /> : <IconTick />}
          theme='borderless'
          style={{
            margin: '2px 0 2px',
            minHeight: '38px',
            minWidth: '38px',
          }}
        >
          {show_text ? (sub === null ? '订阅' : '已订阅') : undefined}
        </Button>
      </Dropdown>
      <SubscriptionEditModal
        current={sub}
        close={() => setEditing(false)}
        update={sub =>
          update(curr => ({ groups: curr?.groups ?? [], ...sub }))()
        }
        visible={editing}
      />
    </>
  )
}
// directory?: string;
// exclude?: string;
// include?: string;
// max_size?: number;
// min_size?: number;
type Advanced = Omit<Subscription, 'groups'>
type AdvancedDisplay = Omit<Advanced, 'max_size' | 'min_size'> & {
  max_size?: string
  min_size?: string
}

const display = (sub: Advanced): AdvancedDisplay => {
  return {
    ...sub,
    max_size: sub.max_size ? format(sub.max_size) : undefined,
    min_size: sub.min_size ? format(sub.min_size) : undefined,
  }
}

function SubscriptionEditModal({
  visible,
  close,
  current,
  update,
}: {
  visible: boolean
  close: () => void
  current: Advanced | null
  update: (sub: Advanced) => Promise<unknown>
}) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const validate_regex = (regex: string) => {
    try {
      new RegExp(regex)
      return ''
    } catch (e) {
      return '无效的正则表达式'
    }
  }
  return (
    <Modal visible={visible} title='编辑订阅' onCancel={close}>
      <Form<Advanced> initValues={current ?? undefined}>
        {({ formState, formApi, values }) => (
          <>
            <Form.Input
              placeholder='下载路径'
              field='directory'
              label='保存目录'
            />
            <Form.Input
              placeholder='用于过滤匹配的条目'
              field='exclude'
              label='排除正则'
              validate={validate_regex}
            />
            <Form.Input
              placeholder='用于保留匹配的条目'
              field='include'
              label='包含正则'
              validate={validate_regex}
            />
            <InputGroup>
              <Form.Input
                placeholder='1m, 3kb, 2GiB'
                field='max_size'
                label='最大文件大小'
              />
            </InputGroup>

            <code style={{ marginTop: 24 }}>{JSON.stringify(formState)}</code>
          </>
        )}
      </Form>
    </Modal>
  )
}
