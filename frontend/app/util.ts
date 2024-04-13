import type { Meta } from 'forrit-client'

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
  return process.env.API_ENDPOINT ?? 'http://localhost:8080'
}

export const get_title = (m: Meta) => {
  return (
    m.title_translate?.['zh-Hans']?.[0] ??
    m.title_translate?.['zh-Hant']?.[0] ??
    m.tv?.original_name ??
    m.title
  )
}

const pattern = /R\/([^/]*)\/P([017][DM])/i

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

export const parse_broadcast = (
  b: string,
): ParsedBroadcast | Record<string, never> => {
  const res = pattern.exec(b)
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
