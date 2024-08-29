import { Col, Form, Row } from '@douyinfe/semi-ui'
import type { FormApi } from '@douyinfe/semi-ui/lib/es/form'
import type { Subscription, WithId } from 'forrit-client'

export default function SubscriptionForm({
  init,
  disabled,
  getFormApi,
}: {
  init: Subscription
  disabled: boolean
  getFormApi?: (form: FormApi<Subscription>) => void
}) {
  return (
    <Form<Subscription>
      getFormApi={form => getFormApi?.(form)}
      labelPosition='inset'
      className='subscription-form'
      initValues={init}
      disabled={disabled}
    >
      <Row>
        <Col span={12}>
          <Form.Input pure field='team' label='字幕组' trigger='blur' />
        </Col>
        <Col span={12}>
          <Form.Input pure field='directory' label='目录' trigger='blur' />
        </Col>
      </Row>
      <Row>
        <Col span={14}>
          <Form.Input
            pure
            field='include'
            label='包含正则'
            trigger='blur'
            rules={[{ type: 'regexp', message: '包含正则不合法' }]}
          />
        </Col>
        <Col span={10}>
          <Form.InputNumber
            pure
            field='min_size'
            label='最小'
            trigger='blur'
            validate={(val, values) => {
              const max = values.max_size as number | undefined | null
              if (max && val > max) {
                return `文件最小值 (${val}) 不能大于文件最大值 (${max})`
              }
              return ''
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col span={14}>
          <Form.Input
            pure
            field='exclude'
            label='排除正则'
            trigger='blur'
            rules={[{ type: 'regexp', message: '排除正则不合法' }]}
          />
        </Col>
        <Col span={10}>
          <Form.InputNumber pure field='max_size' label='最大' trigger='blur' />
        </Col>
      </Row>
    </Form>
  )
}
