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

import { useClient } from '../../client'

import './item.css'

const { Text } = Typography

export interface SubscriptionItemProps {
  subs: WithId<Subscription>[]
  meta_id: string
  no_padding?: boolean
  onDelete: (id: string) => void
  onAdd: (sub: WithId<Subscription>) => void
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
  const c = useClient()
  const [state, set_state] = useState<Record<string, ItemState>>({})
  const [forms, set_forms] = useState<Record<string, FormApi<Subscription>>>({})

  const has_subs = subs.length > 0
  const [active, set_active] = useState(subs[0]?._id.$oid ?? '')
  const active_editing = state[active] ?? false

  const onAddHandler = () => {
    alert('NOT IMPLEMENTED')
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
            <Button icon={<IconSave />} />
          ) : (
            <Button
              icon={<IconEdit />}
              disabled={!has_subs}
              onClick={() => alert('NOT IMPLEMENTED')}
            />
          )}
          <Button
            icon={<IconDelete />}
            disabled={!has_subs}
            onClick={() => alert('NOT IMPLEMENTED')}
          />
          <Button icon={<IconPlus onClick={onAddHandler} />} />
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
            key={sub._id.$oid}
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
