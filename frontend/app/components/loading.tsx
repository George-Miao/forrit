import { Notification, Spin } from '@douyinfe/semi-ui'
import type { Ret } from 'app/client'
import { type ReactNode, useState } from 'react'

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
  size,
  spin,
  spinStyle,
}: LoadingProps<T>) {
  const { data, isLoading, error } = useData()
  const [errorShowed, setShowed] = useState(false)

  size = size ?? 'middle'
  spin = spin ?? true

  if (spin && isLoading) {
    return (
      <Spin
        size={size}
        style={{
          display: 'block',
          margin: 'auto',
          marginTop:
            size === 'large' ? '5em' : size === 'middle' ? '3.5em' : '1.5em',
          ...spinStyle,
        }}
      />
    )
  }

  if (error) {
    if (!errorShowed) {
      setShowed(true)
      Notification.open({
        title: '加载失败',
        content: `${error}`,
        duration: 3,
      })
    }
    return
  }

  return data ? children(data) : null
}
