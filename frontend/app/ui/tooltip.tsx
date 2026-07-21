import { Tooltip } from '@base-ui/react/tooltip'
import type { ReactElement, ReactNode } from 'react'

export default function Hint({
  children,
  content,
  side = 'top',
}: {
  children: ReactElement
  content: ReactNode
  side?: 'bottom' | 'left' | 'right' | 'top'
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={8}>
          <Tooltip.Popup className="ui-popup max-w-72 px-3 py-2 text-muted">
            {content}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
