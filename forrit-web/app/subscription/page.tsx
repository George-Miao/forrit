'use client'

import { useSubscription } from './hooks'

export interface Record {
  tag: string
  name: string
}

export interface Subscribe {
  id: string
  bangumi: Record
  team?: Record
  tags: string[]
  season?: number
  dir?: string
  include_pattern?: string
  exclude_pattern?: string
}

export default function Home() {
  const { data, error, isLoading } = useSubscription()

  if (isLoading) return <></>
  else if (error) return <div>{`${error}`}</div>
  else
    return (
      <table className="text-left table-fixed min-w-[max(30em,100%)]">
        <thead className="h-14 font-medium opacity-40">
          <tr className="">
            <th className="text-lg pl-4">Bangumi</th>
            <th className="text-lg">Team</th>
            <th className="text-lg">Season</th>
            <th className="text-lg">Ex.</th>
            <th className="text-lg">In.</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(item => (
            <SubscribeItem {...item} key={item.id} />
          ))}
        </tbody>
      </table>
    )
}

export function SubscribeItem({
  bangumi,
  id,
  tags,
  dir,
  exclude_pattern,
  include_pattern,
  season,
  team
}: Subscribe) {
  return (
    <tr className="min-w-full font-light hover:bg-black/5">
      <th className="font-medium text-left pl-4 py-2">{bangumi.name}</th>
      <th>{team?.name}</th>
      <th className="opacity-60">{season}</th>
      <th className="opacity-60">{exclude_pattern}</th>
      <th className="opacity-60">{include_pattern}</th>
    </tr>
  )
}
