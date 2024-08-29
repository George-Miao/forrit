import { Spin } from '@douyinfe/semi-ui'
import type { ListResult } from 'forrit-client'
import type { SWRInfiniteResponse } from 'swr/infinite'
import InfiniteLoader from 'react-swr-infinite-scroll'

export interface LoadingInfiniteProps<T> {
  useData: SWRInfiniteResponse<ListResult<T> | undefined, unknown>
  children: (data: T[]) => JSX.Element
}

export default function LoadingInfinite<T>({
  useData,
  children,
}: LoadingInfiniteProps<T>) {
  const has_next_page =
    useData.data?.[useData.data.length - 1]?.page_info.has_next_page

  return (
    <InfiniteLoader<ListResult<T> | undefined>
      swr={useData}
      isReachingEnd={has_next_page === false}
      loadingIndicator={
        <Spin
          style={{
            display: 'block',
            margin: '4em auto',
          }}
        />
      }
      offset={-300}
    >
      {data => data && children(data.items)}
    </InfiniteLoader>
  )
}
