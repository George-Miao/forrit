import type { MetaFunction } from '@remix-run/react'
import { useDownloadList } from 'app/client'
import DownloadItem from 'app/components/download_list'
import LoadingInfinite from 'app/components/loading_infinite'
import PageHeader from 'app/components/page_header'
import WidthLimit from 'app/components/width_limit'

export const meta: MetaFunction = () => [{ title: '下载 | Forrit' }]

export default function Download() {
  return (
    <>
      <PageHeader routes={[{ href: '/', name: '首页' }, { name: '下载' }]}>
        <h1 className="mb-8 mt-16 text-4xl font-600 text-[rgb(28_31_35/80%)]">
          下载
        </h1>
      </PageHeader>
      <WidthLimit>
        <div className="w-full divide-y divide-edge">
          <LoadingInfinite data={useDownloadList()}>
            {(data) =>
              data.length ? (
                <>
                  {data.map((item) => (
                    <DownloadItem item={item} key={item._id.$oid} />
                  ))}
                </>
              ) : (
                <p className="mt-8 text-muted">暂无下载</p>
              )
            }
          </LoadingInfinite>
        </div>
      </WidthLimit>
    </>
  )
}
