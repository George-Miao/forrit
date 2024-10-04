/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/rules-of-hooks */
import { List, Space } from '@douyinfe/semi-ui'
import Text from '@douyinfe/semi-ui/lib/es/typography/text'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useExtractedMeta, useMetaEntries } from 'app/client'
import EntryListItem from 'app/components/entry_list/item'
import Loading from 'app/components/loading'
import LoadingInfinite from 'app/components/loading_infinite'
import MetaDetailHeader from 'app/components/meta_detail_header'
import PageHeader from 'app/components/page_header'
import WidthLimit from 'app/components/width_limit'
import { type ExtractedMeta, extract_entry, use_is_big } from 'app/util'

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
  const is_big = use_is_big()
  const detail = (
    <MetaDetailHeader
      vertical={is_big}
      meta={meta}
      style={
        is_big ? { position: 'sticky', top: '2rem' } : { paddingBottom: '1em' }
      }
    />
  )
  const list = (
    <Space vertical align='start' spacing='loose' style={{ width: '100%' }}>
      <List
        style={{ width: '100%' }}
        emptyContent={
          <Text
            type='tertiary'
            style={{
              display: 'block',
              marginTop: '2rem',
            }}
          >
            暂无资源
          </Text>
        }
      >
        <LoadingInfinite data={useMetaEntries(meta.id)}>
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
  )

  return (
    <>
      <PageHeader
        routes={[
          { href: '/', name: '首页' },
          { href: '/meta', name: '番剧' },
          { name: meta.title },
        ]}
      >
        {!is_big && detail}
      </PageHeader>

      <WidthLimit
        topPadding={is_big}
        style={{
          display: 'flex',
          gap: '2.5rem',
          paddingLeft: '2rem',
          maxWidth: 'calc(1200px + 4rem)',
        }}
      >
        {is_big ? (
          <>
            <aside style={{ width: '400px' }}>{detail}</aside>
            {list}
          </>
        ) : (
          list
        )}
      </WidthLimit>
    </>
  )
}
