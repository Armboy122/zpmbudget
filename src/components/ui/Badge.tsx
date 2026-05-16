import type { ReactNode } from 'react'

type BadgeVariant = 'zpm' | 'welfare' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'

const variantClasses: Record<BadgeVariant, string> = {
  zpm: 'bg-accent-zpm-soft text-accent-zpm-strong',
  welfare: 'bg-status-warning-bg text-status-warning',
  info: 'bg-surface-sunken text-fg-secondary',
  success: 'bg-status-success-bg text-status-success',
  warning: 'bg-status-warning-bg text-status-warning',
  danger: 'bg-status-danger-bg text-status-danger',
  neutral: 'bg-surface-sunken text-fg-secondary',
}

type Props = {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'neutral', children, className = '' }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center gap-px',
        'px-1.5 py-px',
        'rounded-pill',
        'text-kicker font-semibold tracking-widest',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
