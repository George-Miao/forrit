import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import type { ComponentPropsWithoutRef } from 'react'

export const TabRoot = BaseTabs.Root

export function TabList({
  className = '',
  ...props
}: ComponentPropsWithoutRef<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={`ui-tab-list relative flex gap-1 overflow-x-auto rounded-lg bg-background p-1 ${className}`}
      {...props}
    />
  )
}

export function Tab({
  className = '',
  ...props
}: ComponentPropsWithoutRef<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={`ui-tab ui-focus relative z-1 flex shrink-0 items-center gap-2 rounded-md border-0 bg-transparent px-4 py-2.5 text-sm font-600 text-muted transition-colors hover:text-text ${className}`}
      {...props}
    />
  )
}

export function TabIndicator({
  className = '',
  ...props
}: ComponentPropsWithoutRef<typeof BaseTabs.Indicator>) {
  return (
    <BaseTabs.Indicator
      className={`ui-tab-indicator absolute inset-y-1 left-0 z-0 rounded-md bg-accent shadow-sm ${className}`}
      {...props}
    />
  )
}

export function TabPanel({
  className = '',
  ...props
}: ComponentPropsWithoutRef<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel
      className={`pt-5 outline-none [[hidden]]:hidden ${className}`}
      {...props}
    />
  )
}
