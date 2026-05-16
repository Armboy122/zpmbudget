'use client'

import { useRef } from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'ค้นหารหัส/ชื่อ สปก.' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none text-sm"
      >
        🔎
      </span>
      <input
        ref={inputRef}
        aria-label="ค้นหา สปก."
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          'w-full h-9 pl-[calc(var(--space-3)+20px)] pr-3',
          'rounded-md border border-border-default bg-surface-card',
          'text-fg-primary text-small',
          'transition-[border-color] duration-fast',
          'outline-none focus:border-accent-bud',
          'placeholder:text-fg-tertiary',
        ].join(' ')}
        type="search"
        value={value}
      />
      {value && (
        <button
          aria-label="ล้างการค้นหา"
          onClick={() => { onChange(''); inputRef.current?.focus() }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-fg-tertiary text-sm px-1 py-[2px]"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  )
}
