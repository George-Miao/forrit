import { Typography } from '@douyinfe/semi-ui'
import hooks from 'app/client'
import EntryList from 'app/components/entry_list'
import WidthLimit from 'app/components/width_limit'
import PageHeader from 'app/components/page_header'
import InfiniteLoader from 'react-swr-infinite-scroll'
import type { ListResult, PartialEntry, WithId } from 'forrit-client'
import LoadingInfinite from 'app/components/loading_infinite'

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
        <LoadingInfinite useData={hooks.useEntryList()}>
          {data => <EntryList data={data} show_meta />}
        </LoadingInfinite>
      </WidthLimit>
    </>
  )
}
