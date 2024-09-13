import { useEntryList } from 'app/client'
import EntryList from 'app/components/entry_list'
import WidthLimit from 'app/components/width_limit'
import LoadingInfinite from 'app/components/loading_infinite'
import PageHeader from 'app/components/page_header'
import { Typography } from '@douyinfe/semi-ui'

const { Title } = Typography

export default function Entry() {
  return (
    <>
      <PageHeader routes={[{ href: '/', name: '首页' }, { name: '更新' }]}>
        <Title type='secondary' style={{ margin: '2em 0 1em' }}>
          更新
        </Title>
      </PageHeader>
      <WidthLimit top>
        <LoadingInfinite useData={useEntryList()}>
          {data => <EntryList data={data} show_meta />}
        </LoadingInfinite>
      </WidthLimit>
    </>
  )
}
