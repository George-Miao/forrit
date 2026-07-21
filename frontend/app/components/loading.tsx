import type { Ret } from 'app/client'
import { type ReactNode, useEffect } from 'react'
import { notify } from '../ui/toast'

export interface LoadingProps<T> {
  useData: () => Ret<T>
  children: (data: NonNullable<T>) => ReactNode
  size?: 'small' | 'middle' | 'large'
  spin?: boolean
  spinStyle?: React.CSSProperties
}

export default function Loading<T>({
  useData,
  children,
  size = 'middle',
  spin = true,
  spinStyle,
}: LoadingProps<T>) {
  const { data, isLoading, error } = useData()

  useEffect(() => {
    if (!error) return
    const message = error.toString()
    notify(
      '加载失败',
      message.length > 100 ? `${message.slice(0, 100)}...` : message,
    )
  }, [error])

  if (spin && isLoading) {
    const sizes = { large: 'h-9 w-9', middle: 'h-6 w-6', small: 'h-4 w-4' }
    const margins = { large: 'mt-20', middle: 'mt-14', small: 'mt-6' }
    return (
      <span
        aria-label="加载中"
        className={`block animate-spin rounded-full border-2 border-edge border-t-accent ${sizes[size]} ${margins[size]}`}
        role="status"
        style={{ marginLeft: 'auto', marginRight: 'auto', ...spinStyle }}
      />
    )
  }

  if (error) return null
  return data ? children(data) : null
}
