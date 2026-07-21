import {
  type ClientLoaderFunctionArgs,
  json,
  useLoaderData,
} from '@remix-run/react'
import { useExtractedMeta, useMetaEntries } from 'app/client'
import EntryListItem from 'app/components/entry_list/item'
import Loading from 'app/components/loading'
import LoadingInfinite from 'app/components/loading_infinite'
import MetaDetailHeader from 'app/components/meta_detail_header'
import PageHeader from 'app/components/page_header'
import WidthLimit from 'app/components/width_limit'
import { type ExtractedMeta, extract_entry, use_is_big } from 'app/util'

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  return json({ id: params.id as string })
}

export default function MetaDetail() {
  const id = useLoaderData<typeof clientLoader>().id

  return (
    <Loading size="large" useData={() => useExtractedMeta(id)}>
      {(data) => <Loaded meta={data} />}
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
    <div className="w-full divide-y divide-edge">
      <LoadingInfinite data={useMetaEntries(meta.id)}>
        {(data) =>
          data.length ? (
            <>
              {data.map((entry) => (
                <EntryListItem
                  key={entry._id.$oid}
                  item={extract_entry(entry)}
                  show_meta={false}
                />
              ))}
            </>
          ) : (
            <p className="mt-8 text-muted">暂无资源</p>
          )
        }
      </LoadingInfinite>
    </div>
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
        className="flex gap-10 pl-8"
        style={{
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
