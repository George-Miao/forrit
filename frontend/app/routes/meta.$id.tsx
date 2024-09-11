/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/rules-of-hooks */
import { Breadcrumb, Space, Typography } from '@douyinfe/semi-ui'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useRerender, type ExtractedMeta } from 'app/util'
import hooks from 'app/client'
import Loading from 'app/components/loading'
import MetaEntryList from 'app/components/entry_list'
import MetaDetailHeader, {
  header_height,
} from 'app/components/meta_detail_header'
import WidthLimit from 'app/components/width_limit'
import PageHeader from 'app/components/page_header'
import SubscriptionItem from 'app/components/subscription_list/item'
import { useState } from 'react'
import type { Subscription, WithId } from 'forrit-client'
import LoadingInfinite from 'app/components/loading_infinite'

const { Title } = Typography

export async function loader({ params }: LoaderFunctionArgs) {
  return json({
    id: params.id as string,
  })
}

export default function MetaDetail() {
  function useData() {
    const id = useLoaderData<typeof loader>().id
    return hooks.useExtractedMeta(id)
  }
  return (
    <Loading size='large' useData={useData}>
      {data => <Loaded meta={data} />}
    </Loading>
  )
}

export function Loaded({ meta }: { meta: ExtractedMeta }) {
  const rerender = useRerender()
  const subs = hooks.useMetaSubs(meta.id)
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

      <WidthLimit top>
        <Space vertical align='start' spacing='loose' style={{ width: '100%' }}>
          <LoadingInfinite useData={subs}>
            {data => (
              <SubscriptionItem
                no_padding
                meta_id={meta.id}
                subs={data}
                onAdd={() => alert('NOT IMPLEMENTED')}
                onDelete={() => {}}
              />
            )}
          </LoadingInfinite>

          <Title heading={4} type='secondary'>
            更新
          </Title>

          <LoadingInfinite useData={hooks.useMetaEntries(meta.id)}>
            {data => <MetaEntryList data={data} />}
          </LoadingInfinite>
        </Space>
      </WidthLimit>
    </>
  )
}
