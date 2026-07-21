import { Button as BaseButton } from '@base-ui/react/button'
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
} from 'react'

type ButtonProps = ComponentPropsWithoutRef<typeof BaseButton> & {
  variant?: 'default' | 'ghost' | 'danger' | 'primary'
}

const variants = {
  default:
    'border border-edge bg-surface hover:border-[rgb(28_31_35/18%)] hover:bg-background hover:shadow-sm',
  danger: 'border-0 bg-transparent text-danger hover:bg-red-50',
  ghost:
    'border-0 bg-transparent hover:bg-[rgb(28_31_35/8%)] hover:text-text',
  primary: 'border-0 bg-accent text-white hover:brightness-95',
}

const Button = forwardRef<ComponentRef<typeof BaseButton>, ButtonProps>(
  ({ className = '', variant = 'default', ...props }, ref) => (
    <BaseButton
      className={`ui-button ui-focus ${variants[variant]} ${className}`}
      ref={ref}
      {...props}
    />
  ),
)

Button.displayName = 'Button'

export default Button
