import {
  Button,
  ButtonGroup,
  Empty,
  Notification,
  Tabs,
  Typography,
} from '@douyinfe/semi-ui'
import * as _ from 'radash'
import type { Subscription, WithId } from 'forrit-client'
import SubscriptionForm from './form'
import { useState } from 'react'
import { IconDelete, IconEdit, IconPlus, IconSave } from '@douyinfe/semi-icons'
import type { FormApi } from '@douyinfe/semi-ui/lib/es/form'
import { mutate } from 'swr'

import './item.css'
import { client } from 'app/client'

const { Text } = Typography

export interface SubscriptionItemProps {
  subs: WithId<Subscription>[]
  meta_id: string
  no_padding?: boolean
  onDelete: (id: string) => void
  onAdd?: (sub: WithId<Subscription>) => void
}

enum ItemState {
  Normal = 0,
  Editing = 1,
  New = 2,
}

export default function SubscriptionItem({
  subs,
  meta_id,
  onDelete,
  no_padding,
}: SubscriptionItemProps) {
  const c = client()
  const [state, set_state] = useState<Record<string, ItemState>>({})
  const [forms, set_forms] = useState<Record<string, FormApi<Subscription>>>({})

  const has_subs = subs.length > 0
  const [active, set_active] = useState(subs[0]?._id.$oid ?? '')
  const active_editing = state[active] ?? false

  const on_add = () => {}
  const on_edit = () =>
    has_subs &&
    set_state(val => ({
      ...val,
      [active]: ItemState.Editing,
    }))
  const on_delete = () => {
    if (!has_subs) return
    c.DELETE('/subscription/{id}', { params: { path: { id: active } } })
    subs = subs.filter(({ _id }) => _id.$oid !== active)
    mutate('/subscription')
    mutate(`/subscription/${active}`)
    set_forms(({ [active]: _, ...rest }) => rest)
    set_active(subs[0]?._id.$oid ?? '')
    onDelete(active)
  }
  const on_save = () => {
    const form = forms[active]
    form
      .validate()
      .then(sub => {
        const current = state[active]
        set_state(val => {
          return {
            ...val,
            [active]: ItemState.Normal,
          }
        })

        if (current === ItemState.New) {
          mutate('/subscription')
          return c.POST('/subscription', { body: sub }).then(() => {})
        }

        if (_.isEqual(form.getInitValues(), sub)) {
          return
        }
        mutate('/subscription')
        mutate(`/subscription/${active}`, sub)
        return c
          .PUT('/subscription/{id}', {
            params: {
              path: {
                id: active,
              },
            },
            body: sub,
          })
          .then(() => {})
      })
      .catch(x => {
        const error_field = Object.getOwnPropertyNames(x)[0]
        form.reset()
        Notification.error({
          title: '修改订阅失败',
          content: x[error_field],
          duration: 3,
        })
      })
  }

  no_padding = no_padding ?? false

  return (
    <Tabs
      collapsible
      activeKey={active}
      size='small'
      type='card'
      onChange={set_active}
      style={{ width: '100%' }}
      tabBarExtraContent={
        <ButtonGroup theme='borderless'>
          {active_editing ? (
            <Button icon={<IconSave />} onClick={on_save} />
          ) : (
            <Button
              icon={<IconEdit />}
              disabled={!has_subs}
              onClick={on_edit}
            />
          )}
          <Button
            icon={<IconDelete />}
            disabled={!has_subs}
            onClick={on_delete}
          />
          <Button icon={<IconPlus onClick={on_add} />} />
        </ButtonGroup>
      }
    >
      {!has_subs ? (
        <Tabs.TabPane tab='暂无订阅' itemKey=''>
          <Empty title={<Text type='tertiary'>暂无订阅</Text>} />
        </Tabs.TabPane>
      ) : (
        subs.map((sub, i) => (
          <Tabs.TabPane
            style={{
              padding: no_padding ? undefined : '.3em .6em',
              boxSizing: 'border-box',
            }}
            tab={i + 1}
            itemKey={sub._id.$oid}
          >
            <SubscriptionForm
              disabled={!active_editing}
              init={sub}
              getFormApi={form => {
                set_forms(prev => ({
                  ...prev,
                  [sub._id.$oid]: form,
                }))
              }}
            />
          </Tabs.TabPane>
        ))
      )}
    </Tabs>
  )
}
