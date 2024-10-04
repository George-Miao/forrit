import type { ListResult } from 'forrit-client'
import InfiniteLoader from 'react-swr-infinite-scroll'
import type { SWRInfiniteResponse } from 'swr/infinite'

export interface LoadingInfiniteProps<T> {
  data: SWRInfiniteResponse<ListResult<T> | undefined, unknown>
  children: (data: T[]) => JSX.Element
}

export default function LoadingInfinite<T>({
  data,
  children,
}: LoadingInfiniteProps<T>) {
  const has_next_page =
    data.data?.[data.data.length - 1]?.page_info.has_next_page

  return (
    <InfiniteLoader<ListResult<T> | undefined>
      swr={data}
      isReachingEnd={has_next_page === false}
      // loadingIndicator={
      //   <Spin
      //     style={{
      //       display: 'block',
      //       margin: '4em auto',
      //     }}
      //   />
      // }
      offset={-300}
    >
      {data => data && children(data.items)}
    </InfiniteLoader>
  )
}
