import { Url } from 'next/dist/shared/lib/router/router'
import Link from 'next/link'
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
export interface AnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export default function Button({
  toggle = false,
  children,
  className,
  ...prop
}: {
  toggle?: boolean
  children: React.ReactNode
} & (ButtonProps | AnchorProps)) {
  const Comp = 'href' in prop ? Link : 'button'

  return (
    <Comp
      href={(prop as { href: Url }).href}
      className={`${
        className ?? ''
      } cursor-pointer text-center items-center transition-colors `}
    >
      {children}
    </Comp>
  )
}
