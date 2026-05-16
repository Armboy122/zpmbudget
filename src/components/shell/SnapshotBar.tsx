'use client'

import { fmt } from '@/lib/format'
import type { SnapshotMeta } from '@/types/dashboard'

type Props = {
  currentId?: string
  disabled?: boolean
  onReload: () => void
  onSelect: (id: string) => void
  snapshots: SnapshotMeta[]
  spkCount: number
  deptCount: number
}

export function SnapshotBar({
  currentId,
  disabled,
  onReload,
  onSelect,
  snapshots,
  spkCount,
  deptCount,
}: Props) {
  return (
    <div className="no-print flex items-center gap-3 px-4 py-3 bg-surface-sunken border border-border-subtle rounded-md mb-5 flex-wrap">
      {/* Calendar icon label */}
      <span className="text-fg-tertiary text-base shrink-0" aria-hidden="true">📅</span>
      <span className="text-small text-fg-secondary shrink-0">ข้อมูล ณ:</span>

      {/* Snapshot dropdown */}
      <select
        aria-keyshortcuts="s"
        aria-label="เลือก snapshot"
        className="h-[34px] px-3 rounded-md border border-border-default bg-surface-card text-fg-primary text-small cursor-pointer flex-[1_1_240px] min-w-0 transition duration-fast hover:border-border-strong focus:outline-none focus:shadow-focus disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled || snapshots.length === 0}
        onChange={(e) => onSelect(e.target.value)}
        value={currentId || ''}
      >
        <option disabled value="">
          เลือกตามวันที่อัปโหลด
        </option>
        {snapshots.map((snap) => (
          <option key={snap.id} value={snap.id}>
            {fmt.date(snap.createdAt || snap.uploadedAt)} · {snap.label}
          </option>
        ))}
      </select>

      {/* Reload button */}
      <button
        aria-keyshortcuts="r"
        aria-label="โหลด snapshot ล่าสุด"
        className="snapshot-bar-actions h-[34px] px-3 rounded-md border border-border-default bg-surface-card text-fg-secondary text-small cursor-pointer flex items-center gap-1 shrink-0 transition duration-fast hover:bg-surface-sunken hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
        onClick={onReload}
        title="กด R เพื่อโหลดใหม่"
        type="button"
      >
        ↻ โหลดล่าสุด
      </button>

      {/* Meta info */}
      <span className="text-caption text-fg-tertiary ml-auto shrink-0">
        {spkCount} สปก. · {deptCount} แผนก · {snapshots.length} snapshot ใน DB
      </span>
    </div>
  )
}
