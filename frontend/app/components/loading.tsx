import { Banner, Spin } from '@douyinfe/semi-ui'
import type { Ret } from 'app/client'

export interface LoadingProps<T> {
  useData: () => Ret<T>
  children: (data: NonNullable<T>) => JSX.Element
  size?: 'small' | 'middle' | 'large'
  spin?: boolean
}

export default function Loading<T>({
  useData,
  children,
  size,
  spin,
}: LoadingProps<T>) {
  const { data, isLoading, error } = useData()
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
        }}
      />
    )
  }

  if (error) {
    return <Banner description={error.toString()} />
  }

  return data ? children(data) : null
}
