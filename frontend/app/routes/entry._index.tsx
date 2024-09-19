import { useEntryList } from 'app/client'
import WidthLimit from 'app/components/width_limit'
import LoadingInfinite from 'app/components/loading_infinite'
import PageHeader from 'app/components/page_header'
import { List, Typography } from '@douyinfe/semi-ui'
import Text from '@douyinfe/semi-ui/lib/es/typography/text'
import EntryListItem from 'app/components/entry_list/item'
import { extract_entry, use_is_md } from 'app/util'
import type { PartialEntry, WithId } from 'forrit-client'

const { Title } = Typography

export default function Entry() {
  return (
    <>
      <PageHeader routes={[{ href: '/', name: '首页' }, { name: '更新' }]}>
        <Title type='secondary' style={{ margin: '2em 0 1em' }}>
          更新
        </Title>
      </PageHeader>
      <WidthLimit>
        <List
          style={{ width: '100%' }}
          emptyContent={
            <Text
              type='tertiary'
              style={{
                display: 'block',
                marginTop: '2em',
              }}
            >
              暂无资源
            </Text>
          }
        >
          <LoadingInfinite useData={useEntryList()}>
            {data => (
              <>
                {(data as WithId<PartialEntry>[]).map(item => (
                  <EntryListItem
                    key={item._id.$oid}
                    item={extract_entry(item)}
                    show_meta
                  />
                ))}
              </>
            )}
          </LoadingInfinite>
        </List>
      </WidthLimit>
    </>
  )
}
