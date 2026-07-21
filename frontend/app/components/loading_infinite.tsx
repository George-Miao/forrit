import type { ListResult } from 'forrit-client'
import { useEffect, useRef } from 'react'
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
  const trigger = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = trigger.current
    if (!node || has_next_page === false) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !data.isValidating) {
          void data.setSize((size) => size + 1)
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [data.isValidating, data.setSize, has_next_page])

  const items = data.data?.flatMap((page) => page?.items ?? []) ?? []

  return (
    <>
      {children(items)}
      <div ref={trigger}>
        {data.isValidating && (
          <span
            aria-label="加载中"
            className="mx-auto my-16 block h-6 w-6 animate-spin rounded-full border-2 border-edge border-t-accent"
            role="status"
          />
        )}
      </div>
    </>
  )
}
