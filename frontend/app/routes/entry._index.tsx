import { useEntryList } from 'app/client'
import EntryListItem from 'app/components/entry_list/item'
import LoadingInfinite from 'app/components/loading_infinite'
import PageHeader from 'app/components/page_header'
import WidthLimit from 'app/components/width_limit'
import { extract_entry } from 'app/util'
import type { PartialEntry, WithId } from 'forrit-client'

export default function Entry() {
  return (
    <>
      <PageHeader routes={[{ href: '/', name: '首页' }, { name: '更新' }]}>
        <h1 className="mb-8 mt-16 text-4xl font-600 text-[rgb(28_31_35/80%)]">
          更新
        </h1>
      </PageHeader>
      <WidthLimit>
        <div className="w-full divide-y divide-edge">
          <LoadingInfinite data={useEntryList()}>
            {(data) =>
              data.length ? (
                <>
                  {(data as WithId<PartialEntry>[]).map((item) => (
                    <EntryListItem
                      item={extract_entry(item)}
                      key={item._id.$oid}
                      show_meta
                    />
                  ))}
                </>
              ) : (
                <p className="mt-8 text-muted">暂无资源</p>
              )
            }
          </LoadingInfinite>
        </div>
      </WidthLimit>
    </>
  )
}
