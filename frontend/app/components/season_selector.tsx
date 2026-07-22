import { useSearchParams } from '@remix-run/react'
import Button from 'app/ui/button'
import Icon from 'app/ui/icon'
import { ClickPopover } from 'app/ui/popover'
import type { Season } from 'forrit-client'
import { useEffect, useState } from 'react'

export const seasons: { value: Season; label: string }[] = [
  { value: 'winter', label: '冬季新番' },
  { value: 'spring', label: '春季新番' },
  { value: 'summer', label: '夏季新番' },
  { value: 'fall', label: '秋季新番' },
]

export function getCurrentSeason() {
  const now = new Date()
  return {
    season: seasons[Math.floor(now.getMonth() / 3)].value,
    year: now.getFullYear(),
  }
}

export function getSeasonLabel(season: Season) {
  return seasons.find((item) => item.value === season)?.label
}

export function useSeasonQuery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const fallback = getCurrentSeason()
  const requestedSeason = searchParams.get('season')
  const requestedYear = Number(searchParams.get('year'))
  const season =
    seasons.find((item) => item.value === requestedSeason)?.value ??
    fallback.season
  const year = Number.isInteger(requestedYear) && requestedYear > 0
    ? requestedYear
    : fallback.year

  const selectSeason = (nextYear: number, nextSeason: Season) => {
    setSearchParams({ year: String(nextYear), season: nextSeason })
  }

  return { season, selectSeason, year }
}

export default function SeasonSelector({
  onChange,
  season,
  year,
}: {
  onChange: (year: number, season: Season) => void
  season: Season
  year: number
}) {
  const current = getCurrentSeason()
  const isCurrent = year === current.year && season === current.season
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(String(year))

  useEffect(() => setPickerYear(String(year)), [year])

  const move = (offset: -1 | 1) => {
    const index = seasons.findIndex((item) => item.value === season)
    const nextIndex = index + offset

    if (nextIndex < 0) {
      onChange(year - 1, seasons.at(-1)?.value ?? 'fall')
    } else if (nextIndex >= seasons.length) {
      onChange(year + 1, seasons[0].value)
    } else {
      onChange(year, seasons[nextIndex].value)
    }
  }

  const jumpToCurrent = () => {
    onChange(current.year, current.season)
  }

  const pick = (nextSeason: Season) => {
    const nextYear = Number(pickerYear)
    if (!Number.isInteger(nextYear) || nextYear < 1) return
    onChange(nextYear, nextSeason)
    setPickerOpen(false)
  }

  const picker = (
    <div className="grid w-56 gap-3 p-3">
      <label className="grid gap-1.5 text-sm font-500 text-text">
        年份
        <input
          className="ui-focus h-9 min-w-0 rounded-md border border-edge bg-surface px-3 font-400"
          min="1"
          onChange={(event) => setPickerYear(event.currentTarget.value)}
          type="number"
          value={pickerYear}
        />
      </label>
      <div className="grid grid-cols-2 gap-2" aria-label="选择季度">
        {seasons.map((item) => (
          <Button
            key={item.value}
            onClick={() => pick(item.value)}
            type="button"
            variant={
              Number(pickerYear) === year && item.value === season
                ? 'default'
                : 'ghost'
            }
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex items-center gap-2" aria-label="季度翻页">
      <Button
        aria-label="上一季度"
        className="h-10 w-10 p-0 text-xl"
        onClick={() => move(-1)}
        variant="ghost"
      >
        <Icon name="chevronLeft" />
      </Button>
      <Button
        aria-label="当前季度"
        className="h-10 w-10 p-0 text-lg"
        disabled={isCurrent}
        onClick={jumpToCurrent}
        variant="ghost"
      >
        <Icon name="clock" />
      </Button>
      <Button
        aria-label="下一季度"
        className="h-10 w-10 p-0 text-xl"
        onClick={() => move(1)}
        variant="ghost"
      >
        <Icon name="chevronRight" />
      </Button>
      <ClickPopover
        content={picker}
        onOpenChange={(open) => {
          if (open) setPickerYear(String(year))
          setPickerOpen(open)
        }}
        open={pickerOpen}
      >
        <Button
          aria-label="选择季度"
          className="h-10 w-10 p-0 text-lg"
          variant="ghost"
        >
          <Icon name="calendarSearch" />
        </Button>
      </ClickPopover>
    </div>
  )
}
