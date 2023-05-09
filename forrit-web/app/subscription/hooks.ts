'use client'

import useSWR from 'swr'
import { Subscribe } from './page'
import { useEffect, useState } from 'react'

export const useSubscription = () => {
  console.log('useSubscription')

  // const { data, error, isLoading } = useSWR<Subscribe[]>(
  //   'http://forrit.syr.vec.sh:9090/123',
  //   {
  //     refreshInterval: 0
  //   }
  // )

  const [data, setData] = useState<Subscribe[]>([])
  const [error, setError] = useState<unknown | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetcher = async (url: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(url)
      const json = await res.json()
      setData(json)
    } catch (error) {
      setError(error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetcher('http://forrit.syr.vec.sh:9090/subscription')
  }, [])

  return {
    data,
    error,
    isLoading
  }
}
