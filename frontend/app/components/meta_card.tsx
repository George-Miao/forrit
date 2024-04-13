import { Card, Modal, Typography } from '@douyinfe/semi-ui'
import { get_title, format_broadcast, parse_broadcast } from '../util'
import type { Meta } from 'forrit-client'

import './meta_card.css'
import { useState } from 'react'

const width = 250

export default function MetaCard({ meta }: { meta: Meta }) {
  const { Text } = Typography
  const [visible, setVisible] = useState(false)
  const showDialog = () => {
    setVisible(true)
  }
  const handleOk = () => {
    setVisible(false)
    console.log('Ok button clicked')
  }
  const handleCancel = () => {
    setVisible(false)
    console.log('Cancel button clicked')
  }
  const handleAfterClose = () => {
    console.log('After Close callback executed')
  }
  const cover = meta.tv?.poster_path ? (
    <img
      alt='backdrop'
      width={248}
      height={372}
      src={`https://image.tmdb.org/t/p/original/${meta.tv.poster_path}`}
    />
  ) : null
  const interval = meta.broadcast ? parse_broadcast(meta.broadcast) : {}

  return (
    <>
      <div
        tabIndex={0}
        role='button'
        onClick={showDialog}
        onKeyUp={e => {
          if (e.key === 'Enter' || e.key === 'Space') {
            showDialog()
          }
        }}
      >
        <Card
          shadows='hover'
          bodyStyle={{
            maxWidth: width,
          }}
          style={{ width: width }}
          cover={cover}
          footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <Card.Meta
            style={{ width: '100%' }}
            title={
              <Text ellipsis={{ showTooltip: true }}>{get_title(meta)}</Text>
            }
            description={
              <Text style={{ color: 'var(--semi-color-text-2)' }}>
                {format_broadcast(interval)}
              </Text>
            }
          />
        </Card>
      </div>
      <Modal
        title='基本对话框'
        visible={visible}
        onOk={handleOk}
        afterClose={handleAfterClose} //>=1.16.0
        onCancel={handleCancel}
        closeOnEsc={true}
      />
    </>
  )
}
