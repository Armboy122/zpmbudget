'use client'

import type { SpkItem } from '@/types/dashboard'

type Props = {
  item: SpkItem
  checked: boolean
  onToggle: () => void
}

export function FilterRow({ item, checked, onToggle }: Props) {
  const hasZpm = (Number(item.tz) || 0) > 0

  return (
    <label
      className={[
        'flex items-center gap-2 px-3 py-2 cursor-pointer select-none',
        'border-l-[3px] transition-[background,border-color] duration-fast',
        checked
          ? 'border-l-accent-bud bg-accent-bud-soft/40'
          : 'border-l-transparent bg-transparent',
      ].join(' ')}
    >
      <input
        checked={checked}
        onChange={onToggle}
        className="shrink-0 w-[14px] h-[14px] accent-[var(--accent-bud)]"
        type="checkbox"
      />
      <code
        className="text-mono font-mono bg-surface-sunken border border-border-subtle rounded-sm px-[6px] py-[1px] shrink-0 text-fg-secondary"
      >
        {item.s}
      </code>
      <span
        className="text-small text-fg-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
        title={item.n}
      >
        {item.n}
      </span>
      {hasZpm && (
        <span className="text-kicker font-semibold text-accent-zpm-strong bg-accent-zpm-soft rounded-pill px-[5px] py-[1px] shrink-0">
          Z
        </span>
      )}
      {item.w && (
        <span className="text-kicker font-semibold text-status-warning bg-status-warning-bg rounded-pill px-[5px] py-[1px] shrink-0">
          W
        </span>
      )}
    </label>
  )
}
