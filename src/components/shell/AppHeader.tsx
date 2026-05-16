'use client'

import { fmt } from '@/lib/format'
import type { SnapshotRecord } from '@/types/dashboard'

type Props = {
  current: SnapshotRecord | null
  loading: boolean
  onOpenAdmin: () => void
}

export function AppHeader({ current, loading, onOpenAdmin }: Props) {
  const timestamp = current?.createdAt || current?.uploadedAt
  return (
    <header className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-border-subtle">
      <div className="flex items-center gap-4">
        {/* PEA Logo placeholder */}
        <div
          aria-label="โลโก้ PEA"
          className="w-10 h-10 rounded-md bg-accent-bud text-fg-on-accent flex items-center justify-center font-bold text-sm shrink-0 tracking-tight"
        >
          PEA
        </div>

        <div>
          <p className="text-kicker text-fg-tertiary mb-0.5">
            การไฟฟ้าส่วนภูมิภาค · กสฟ.
          </p>
          <h1 className="text-h1 text-fg-primary mb-1">
            ZPM Budget Dashboard
          </h1>
          {timestamp ? (
            <p className="text-caption text-fg-tertiary">
              ปรับปรุงข้อมูลล่าสุด · {fmt.date(timestamp)}
            </p>
          ) : (
            <p className="text-caption text-fg-tertiary">
              {loading ? 'กำลังโหลด…' : 'ยังไม่มีข้อมูล'}
            </p>
          )}
        </div>
      </div>

      <div className="no-print flex items-center gap-2 shrink-0">
        <button
          aria-label="พิมพ์รายงาน"
          className="no-print h-9 px-3 rounded-md border border-border-default bg-transparent text-fg-secondary text-small cursor-pointer flex items-center gap-1 transition duration-fast hover:bg-surface-sunken hover:border-border-strong"
          onClick={() => window.print()}
          title="Ctrl+P"
          type="button"
        >
          🖨 พิมพ์
        </button>
        <button
          aria-keyshortcuts="a"
          aria-label="อัปโหลด Snapshot ใหม่"
          className="no-print h-9 px-4 rounded-md border border-border-default bg-surface-card text-fg-secondary text-small font-medium cursor-pointer flex items-center gap-1 transition duration-fast hover:bg-surface-sunken hover:border-border-strong"
          data-no-print=""
          onClick={onOpenAdmin}
          type="button"
        >
          ↑ Admin Upload
        </button>
      </div>
    </header>
  )
}
