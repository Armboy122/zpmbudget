import type { ReactNode } from 'react'

type Props = {
  label: string
  value: string
  sub?: string
  accentColor?: 'bud' | 'zpm' | 'none'
  children?: ReactNode
}

export function MetricCard({ label, value, sub, accentColor = 'none', children }: Props) {
  const leftBorderClass =
    accentColor === 'bud' ? 'border-l-accent-bud'
    : accentColor === 'zpm' ? 'border-l-accent-zpm'
    : 'border-l-transparent'

  return (
    <article
      className={[
        'bg-surface-card',
        'border border-border-subtle border-l-[3px]',
        leftBorderClass,
        'rounded-lg',
        'shadow-card',
        'px-5 py-4',
        'flex flex-col gap-1',
        'cursor-default',
        'transition-all duration-[120ms]',
        'hover:shadow-card-hover hover:-translate-y-px',
      ].join(' ')}
    >
      <p className="text-small text-fg-secondary font-medium">{label}</p>
      <p className="tabular text-metric font-bold text-fg-primary">{value}</p>
      {sub && (
        <p className="text-caption text-fg-tertiary">{sub}</p>
      )}
      {children}
    </article>
  )
}
