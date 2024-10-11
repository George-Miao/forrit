import {
  type ClientLoaderFunctionArgs,
  json,
  useLoaderData,
} from '@remix-run/react'
import { useExtractedEntry } from 'app/client'
import Loading from 'app/components/loading'
import PageHeader from 'app/components/page_header'
import type { ExtractedEntry } from 'app/util'

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  return json({
    id: params.id as string,
  })
}

export default function EntryDetail() {
  function useData() {
    const id = useLoaderData<typeof clientLoader>().id
    return useExtractedEntry(id)
  }
  return (
    <Loading size='large' useData={useData}>
      {data => <Loaded entry={data} />}
    </Loading>
  )
}

function Loaded({ entry }: { entry: ExtractedEntry }) {
  const episode = entry.episode ? `第${entry.episode}集` : ''
  return (
    <>
      <PageHeader
        routes={[
          { href: '/', name: '首页' },
          { href: '/entry', name: '更新' },
          { name: `${entry.meta_title ?? ''} ${episode}` },
        ]}
      >
        {entry.title}
      </PageHeader>
    </>
  )
}
