import type { DirectedCursor, Meta, PartialEntry, WithId } from 'forrit-client'
import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'

export const useRerender = () => {
  const [, set] = useState(false)
  return () => set(v => !v)
}

export type ExtractedInfo = {
  content: string
  tooltip?: string
}

export type ExtractedMeta = ReturnType<typeof extract>

// TODO: Show styled information instead of plain text
export const extract = (meta: WithId<Meta>) => {
  const id = meta._id.$oid
  const title = get_title(meta)
  const year = meta.begin ? new Date(meta.begin).getFullYear() : null
  const poster = make_tmdb_url(meta.tv?.poster_path as string)
  const backdrop = make_tmdb_url(meta.tv?.backdrop_path as string)

  const season =
    meta.season_override ??
    (meta.season
      ? {
          name: meta.season.name,
          number: meta.season.season_number,
        }
      : null)

  const info: ExtractedInfo[] = []
  if (season) {
    info.push({
      content: `第 ${(season.number as number).toString()} 季`,
      tooltip: season.name as string,
    })
  }
  const parsed_broadcast = meta.broadcast ? parse_broadcast(meta.broadcast) : {}
  if (parsed_broadcast.begin) {
    info.push({
      content: format_broadcast(parsed_broadcast),
    })
  }
  if (meta.tv?.vote_average) {
    info.push({
      tooltip: `共${meta.tv.vote_count}票`,
      content: `${(meta.tv?.vote_average as number).toFixed(1)}/10`,
    })
  }

  const overview = meta.tv?.overview

  return {
    ...meta,
    info,
    id,
    title,
    year,
    poster,
    backdrop,
    season,
    overview,
  }
}

export const make_tmdb_url = (path: string | null | undefined) =>
  path ? `https://image.tmdb.org/t/p/original/${path}` : null

export const group_by = <K, T>(list: T[], keyGetter: (item: T) => K) => {
  const map = new Map<K, T[]>()
  for (const item of list) {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  }
  return map
}

export const get_endpoint = () => {
  return process.env.API_ENDPOINT ?? 'http://10.0.1.69:8080'
}

export const get_title = (m: Meta) => {
  const trans = m.title_translate as Record<string, string[]>
  return (
    trans?.['zh-Hans']?.[0] ??
    trans?.['zh-Hant']?.[0] ??
    m.tv?.original_name ??
    m.title
  )
}

export enum BroadcastType {
  OneTime = '0D',
  Daily = '1D',
  Weekly = '7D',
  Monthly = '1M',
}

export interface ParsedBroadcast {
  begin: Date
  type: BroadcastType
}

const broadcast_pattern = /R\/([^/]*)\/P([017][DM])/i
export const parse_broadcast = (
  b: string,
): ParsedBroadcast | Record<string, never> => {
  const res = broadcast_pattern.exec(b)
  if (!res) {
    return {}
  }
  return {
    begin: new Date(res[1]),
    type: res[2] as BroadcastType,
  }
}

export const format_broadcast = ({
  begin,
  type,
}: ParsedBroadcast | Record<string, never>) => {
  if (!begin || !type) {
    return ''
  }
  if (type === BroadcastType.OneTime) {
    return begin.toLocaleString()
  }
  if (type === BroadcastType.Daily) {
    return `每天 ${format_time(begin)}`
  }
  if (type === BroadcastType.Weekly) {
    return `每周${format_day(begin)} ${format_time(begin)}`
  }
  if (type === BroadcastType.Monthly) {
    return `每月${begin.getDate()}日 ${format_time(begin)}`
  }
  return ''
}

export const format_day = (date: Date | number) => {
  const day = typeof date === 'number' ? date : date.getDay()
  return ['日', '一', '二', '三', '四', '五', '六'][day]
}

export const format_time = (date: Date) => {
  const h = date.getHours()
  const m = date.getMinutes()
  return `${h}:${m.toString().padStart(2, '0')}`
}

export const sort_day = (a: number, b: number) => {
  const current = new Date().getDay()
  if (a === b) {
    return 0
  }
  const a_after = a >= current ? a - current : a + 7 - current
  const b_after = b >= current ? b - current : b + 7 - current
  return a_after - b_after
}

export const use_is_xs = () =>
  useMediaQuery({
    query: '(max-width: 520px)',
  })

export const use_is_md = () =>
  useMediaQuery({
    query: '(max-width: 1000px)',
  })

export const format_time_relative = (t: Date) => {
  const pad = (num: number) => num.toString().padStart(2, '0')
  const current = new Date()
  const current_sec = current.getTime() / 1000

  const input = t.getTime() / 1000

  const sec_diff = current_sec - input
  if (sec_diff < 60) {
    return '刚刚'
  }

  const sec_per_min = 60
  const sec_per_hour = 60 * 60
  const sec_per_day = 24 * sec_per_hour
  const sec_per_month = 31 * sec_per_day

  if (sec_diff < sec_per_hour) {
    return `${Math.floor(sec_diff / sec_per_min)} 分钟前`
  }

  if (sec_diff < sec_per_day) {
    return `${Math.floor(sec_diff / sec_per_hour)} 小时前`
  }

  if (sec_diff < sec_per_month) {
    return `${Math.floor(sec_diff / sec_per_day)} 天前`
  }

  const Y = t.getFullYear()
  const M = t.getMonth() + 1
  const D = t.getDate()

  return `${Y}-${pad(M)}-${pad(D)}`
}

export const sort_entry_by_date = (a: PartialEntry, b: PartialEntry) => {
  if (a.pub_date === b.pub_date) {
    return 0
  }
  if (!a.pub_date) {
    return -1
  }

  if (!b.pub_date) {
    return 1
  }
  return +new Date(b.pub_date) - +new Date(a.pub_date)
}
