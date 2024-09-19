/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/rules-of-hooks */
import { List, Space, Typography } from '@douyinfe/semi-ui'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { extract_entry, useRerender, type ExtractedMeta } from 'app/util'
import { useMetaEntries, useExtractedMeta, useMetaSubs } from 'app/client'
import Loading from 'app/components/loading'
import MetaDetailHeader, {
  header_height,
} from 'app/components/meta_detail_header'
import WidthLimit from 'app/components/width_limit'
import PageHeader from 'app/components/page_header'
import LoadingInfinite from 'app/components/loading_infinite'
import Text from '@douyinfe/semi-ui/lib/es/typography/text'
import EntryListItem from 'app/components/entry_list/item'

export async function loader({ params }: LoaderFunctionArgs) {
  return json({
    id: params.id as string,
  })
}

export default function MetaDetail() {
  function useData() {
    const id = useLoaderData<typeof loader>().id
    return useExtractedMeta(id)
  }
  return (
    <Loading size='large' useData={useData}>
      {data => <Loaded meta={data} />}
    </Loading>
  )
}

export function Loaded({ meta }: { meta: ExtractedMeta }) {
  return (
    <>
      <PageHeader
        routes={[
          { href: '/', name: '首页' },
          { href: '/meta', name: '番剧' },
          { name: meta.title },
        ]}
      >
        <MetaDetailHeader meta={meta} />
      </PageHeader>

      <WidthLimit>
        <Space vertical align='start' spacing='loose' style={{ width: '100%' }}>
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
            <LoadingInfinite useData={useMetaEntries(meta.id)}>
              {data => (
                <>
                  {data.map(entry => (
                    <EntryListItem
                      key={entry._id.$oid}
                      item={extract_entry(entry)}
                      show_meta={false}
                    />
                  ))}
                </>
              )}
            </LoadingInfinite>
          </List>
        </Space>
      </WidthLimit>
    </>
  )
}
