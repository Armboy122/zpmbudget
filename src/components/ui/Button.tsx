import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'icon'
type Size = 'md' | 'sm'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const baseClasses =
  'inline-flex items-center gap-2 rounded-md font-medium cursor-pointer border-0 transition-all duration-[120ms] disabled:cursor-not-allowed disabled:opacity-50'

const sizeClasses: Record<Size, string> = {
  md: 'h-10 min-w-[40px] px-4 text-body',
  sm: 'h-8 min-w-[32px] px-3 text-small',
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent-bud text-fg-on-accent hover:brightness-105 active:brightness-95 shadow-sm hover:shadow-card-hover',
  secondary:
    'bg-transparent text-fg-primary border border-border-default hover:bg-surface-sunken active:bg-surface-card',
  tertiary:
    'bg-transparent text-accent-bud px-2 hover:bg-accent-bud-soft active:brightness-95',
  destructive:
    'bg-status-danger text-fg-on-accent hover:brightness-105 active:brightness-95 shadow-sm',
  icon: 'bg-transparent text-fg-secondary p-0 w-9 justify-center rounded-md hover:bg-surface-sunken active:bg-surface-card',
}

const iconSizeOverride: Record<Size, string> = {
  md: 'w-9',
  sm: 'w-8',
}

export function Button({ variant = 'secondary', size = 'md', children, className = '', ...rest }: Props) {
  const isIcon = variant === 'icon'
  const classes = [
    baseClasses,
    isIcon ? iconSizeOverride[size] : sizeClasses[size],
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
