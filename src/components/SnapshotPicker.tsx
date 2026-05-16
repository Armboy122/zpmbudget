import { SnapshotMeta } from '@/types/dashboard'

function formatDate(value?: string) {
  if (!value) return 'ไม่ระบุเวลา'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

type Props = {
  currentId?: string
  disabled?: boolean
  onReload: () => void
  onSelect: (id: string) => void
  snapshots: SnapshotMeta[]
}

export function SnapshotPicker({ currentId, disabled, onReload, onSelect, snapshots }: Props) {
  return (
    <section className="snapshot-strip">
      <div className="snapshot-copy">
        <span className="section-kicker">Snapshots</span>
        <strong>{snapshots.length ? `${snapshots.length} รายการใน DB` : 'ยังไม่พบรายการใน DB'}</strong>
      </div>
      <select
        aria-label="เลือก snapshot"
        className="snapshot-select"
        disabled={disabled || snapshots.length === 0}
        onChange={(event) => onSelect(event.target.value)}
        value={currentId || ''}
      >
        <option value="" disabled>
          เลือกตามวันที่ created/upload
        </option>
        {snapshots.map((snapshot) => (
          <option key={snapshot.id} value={snapshot.id}>
            {formatDate(snapshot.createdAt || snapshot.uploadedAt)} · {snapshot.label}
          </option>
        ))}
      </select>
      <button className="btn mini" disabled={disabled} onClick={onReload} type="button">
        โหลดล่าสุด
      </button>
    </section>
  )
}
