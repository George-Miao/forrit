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
