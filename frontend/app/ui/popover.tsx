import { Popover } from '@base-ui/react/popover'
import type { ReactElement, ReactNode } from 'react'

export default function PreviewPopover({
  children,
  content,
  side = 'right',
}: {
  children: ReactElement
  content: ReactNode
  side?: 'bottom' | 'left' | 'right' | 'top'
}) {
  return (
    <Popover.Root>
      <Popover.Trigger openOnHover render={children} />
      <Popover.Portal>
        <Popover.Positioner side={side} sideOffset={8}>
          <Popover.Popup className="ui-popup p-0">{content}</Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function ClickPopover({
  children,
  content,
  onOpenChange,
  open,
}: {
  children: ReactElement
  content: ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  return (
    <Popover.Root onOpenChange={onOpenChange} open={open}>
      <Popover.Trigger render={children} />
      <Popover.Portal>
        <Popover.Positioner align="center" side="bottom" sideOffset={8}>
          <Popover.Popup className="ui-popup p-0">{content}</Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
