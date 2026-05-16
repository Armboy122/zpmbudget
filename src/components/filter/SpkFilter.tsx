'use client'

import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import type { SpkItem } from '@/types/dashboard'
import { FilterRow } from './FilterRow'
import { SearchInput } from './SearchInput'

type FilterGroup = 'all' | 'none' | 'nowelfare' | 'zpmonly'

type Props = {
  checked: Set<string>
  selectGroup: (group: FilterGroup) => void
  spkList: SpkItem[]
  toggleSpk: (code: string) => void
}

const PRESETS: Array<{ key: FilterGroup; label: string }> = [
  { key: 'all',       label: 'ทั้งหมด' },
  { key: 'zpmonly',   label: 'ZPM' },
  { key: 'nowelfare', label: 'ยกเว้นสวัสดิการ' },
  { key: 'none',      label: 'ล้าง' },
]

export function SpkFilter({ checked, selectGroup, spkList, toggleSpk }: Props) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 100)

  const filtered = debouncedQuery
    ? spkList.filter(
        (item) =>
          item.s.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          item.n.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
    : spkList

  return (
    <section
      aria-label="เลือก สปก."
      className="bg-surface-card border border-border-subtle rounded-lg shadow-card flex flex-col max-h-[480px] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border-subtle flex items-center justify-between">
        <div>
          <p className="text-kicker">SPK Filter</p>
          <h2 className="text-h3 font-semibold">เลือก สปก.</h2>
        </div>
        <span className="text-small font-semibold text-accent-bud bg-accent-bud-soft rounded-pill px-[10px] py-[2px]">
          {checked.size}/{spkList.length} ✓
        </span>
      </div>

      {/* Search + Presets (sticky) */}
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-card sticky top-0 z-[1] flex flex-col gap-2">
        <SearchInput onChange={setQuery} value={query} />
        <div className="flex gap-1 flex-wrap">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => selectGroup(preset.key)}
              className="px-[10px] py-[3px] rounded-pill border border-border-default bg-transparent text-fg-secondary text-caption font-medium cursor-pointer hover:bg-surface-sunken transition-colors duration-fast"
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list */}
      <div role="list" className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="py-7 px-4 text-center text-fg-tertiary text-small">
            ไม่พบรายการที่ค้นหา
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.s} role="listitem">
              <FilterRow
                checked={checked.has(item.s)}
                item={item}
                onToggle={() => toggleSpk(item.s)}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border-subtle bg-surface-sunken flex justify-between items-center">
        <button
          onClick={() => selectGroup('none')}
          className="bg-transparent border-none cursor-pointer text-fg-tertiary text-caption"
          type="button"
        >
          เคลียร์ทั้งหมด
        </button>
        <button
          onClick={() => selectGroup('all')}
          className="bg-transparent border-none cursor-pointer text-accent-bud text-caption font-medium"
          type="button"
        >
          เลือกทั้งหมด
        </button>
      </div>
    </section>
  )
}
