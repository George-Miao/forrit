import { Icon as IconifyIcon } from '@iconify/react'
import activity from '@iconify-icons/lucide/activity'
import bell from '@iconify-icons/lucide/bell'
import check from '@iconify-icons/lucide/check'
import copy from '@iconify-icons/lucide/copy'
import download from '@iconify-icons/lucide/download'
import pencil from '@iconify-icons/lucide/pencil'
import github from '@iconify-icons/lucide/github'
import heart from '@iconify-icons/lucide/heart'
import home from '@iconify-icons/lucide/home'
import plus from '@iconify-icons/lucide/plus'
import save from '@iconify-icons/lucide/save'
import trash from '@iconify-icons/lucide/trash-2'
import x from '@iconify-icons/lucide/x'

const icons = {
  activity,
  bell,
  check,
  copy,
  download,
  edit: pencil,
  github,
  heart,
  home,
  plus,
  save,
  trash,
  x,
} as const

export type IconName = keyof typeof icons

export default function Icon({
  className = '',
  name,
}: {
  className?: string
  name: IconName
}) {
  return (
    <IconifyIcon
      aria-hidden="true"
      className={`pointer-events-none shrink-0 ${className}`}
      icon={icons[name]}
    />
  )
}
