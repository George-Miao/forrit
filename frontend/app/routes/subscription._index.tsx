import { IconPlus } from '@douyinfe/semi-icons'
import { Button, Typography } from '@douyinfe/semi-ui'
import hooks from 'app/client'
import LoadingInfinite from 'app/components/loading_infinite'
import PageHeader from 'app/components/page_header'
import SubscriptionList from 'app/components/subscription_list'
import WidthLimit from 'app/components/width_limit'

const { Title } = Typography

export default function Subscription() {
  return (
    <>
      <PageHeader routes={[{ href: '/', name: '首页' }, { name: '订阅' }]}>
        <Title
          type='secondary'
          style={{
            margin: '2em 0 1em',
          }}
        >
          订阅
        </Title>
      </PageHeader>
      <WidthLimit>
        <Button
          onClick={() => alert('NOT IMPLEMENTED')}
          style={{
            height: 100,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '1em',
            border: '2px dashed var(--semi-color-border)',
          }}
          theme='borderless'
        >
          <IconPlus size='extra-large' />
        </Button>
        <LoadingInfinite useData={hooks.useSubList()}>
          {data => <SubscriptionList data={data} />}
        </LoadingInfinite>
      </WidthLimit>
    </>
  )
}
