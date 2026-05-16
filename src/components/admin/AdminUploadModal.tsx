'use client'

import { useMemo, useRef, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { UploadSummary } from '@/types/dashboard'

const REQUIRED_BUDGET_FILES = new Set([
  'l301034000.xls', 'l301034001.xls', 'l301034010.xls', 'l301034011.xls',
  'l301034020.xls', 'l301034021.xls', 'l301034030.xls', 'l301034031.xls',
  'l301034040.xls', 'l301034041.xls',
])

function detectType(file: File): string {
  const name = file.name.toLowerCase()
  if (name === 'zpm.xls' || name.startsWith('zpm')) return 'ZPM'
  if (name === 'pm.xls' || (name.startsWith('pm') && !name.includes('zpm'))) return 'PM'
  if (/l301034\d+/.test(name)) return 'งบทำการ'
  return 'ไม่รู้จัก'
}

function summarize(files: File[]): UploadSummary {
  return files.reduce<UploadSummary>(
    (acc, f) => {
      const t = detectType(f)
      if (t === 'ZPM') acc.zpm += 1
      else if (t === 'PM') acc.pm += 1
      else if (t === 'งบทำการ') acc.budget += 1
      else acc.unknown += 1
      return acc
    },
    { zpm: 0, pm: 0, budget: 0, unknown: 0 },
  )
}

type StatusLineProps = {
  label: string
  current: number
  required: number
  missing?: string
}

function StatusLine({ label, current, required, missing }: StatusLineProps) {
  const done = current >= required
  const icon = done ? '✓' : current > 0 ? '◐' : '○'

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className={['text-[13px] w-[18px]', done ? 'text-status-success' : 'text-fg-tertiary'].join(' ')}>
        {icon}
      </span>
      <span
        className={[
          'text-small min-w-[80px]',
          done ? 'font-medium text-status-success' : 'font-normal text-fg-secondary',
        ].join(' ')}
      >
        {label}
      </span>
      <span className="text-caption text-fg-tertiary">
        {current}/{required}
        {missing ? ` · ขาด: ${missing}` : ''}
      </span>
    </div>
  )
}

type FileBadgeProps = { type: string }

function FileBadge({ type }: FileBadgeProps) {
  const classes: Record<string, string> = {
    ZPM: 'bg-accent-zpm-soft text-accent-zpm-strong',
    PM: 'bg-accent-bud-soft text-accent-bud-strong',
    ไม่รู้จัก: 'bg-status-danger-bg text-status-danger',
  }
  const cls = classes[type] ?? 'bg-surface-sunken text-fg-secondary'

  return (
    <span
      className={[
        'text-kicker font-semibold rounded-pill px-1.5 py-px',
        cls,
      ].join(' ')}
    >
      {type}
    </span>
  )
}

type Props = {
  open: boolean
  uploading: boolean
  onClose: () => void
  onUpload: (files: File[]) => void
}

export function AdminUploadModal({ open, uploading, onClose, onUpload }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const summary = useMemo(() => summarize(files), [files])
  const budgetNames = useMemo(
    () => new Set(files.map((f) => f.name.toLowerCase()).filter((n) => REQUIRED_BUDGET_FILES.has(n))),
    [files],
  )
  const hasZpm = files.some((f) => f.name.toLowerCase() === 'zpm.xls')
  const hasPm = files.some((f) => f.name.toLowerCase() === 'pm.xls')
  const missingBudget = [...REQUIRED_BUDGET_FILES].filter((n) => !budgetNames.has(n))
  const ready = hasZpm && hasPm && missingBudget.length === 0 && summary.unknown === 0

  function addFiles(list: FileList | null) {
    if (!list) return
    const incoming = Array.from(list)
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      return [...prev, ...incoming.filter((f) => !existing.has(f.name))]
    })
  }

  return (
    <Modal
      onClose={onClose}
      open={open}
      title="อัปโหลด Snapshot ใหม่"
      footer={
        <>
          <button
            onClick={() => setFiles([])}
            type="button"
            className="bg-transparent border-0 cursor-pointer text-fg-tertiary text-small hover:text-fg-secondary transition-colors duration-[120ms]"
          >
            ล้างรายการ
          </button>
          <button
            disabled={!ready || uploading}
            onClick={() => { if (ready && !uploading) onUpload(files) }}
            title={
              !ready
                ? `ขาด: ${missingBudget.slice(0, 3).join(', ')}${missingBudget.length > 3 ? '…' : ''}`
                : ''
            }
            type="button"
            className={[
              'h-10 px-5 rounded-md border-0 font-semibold text-body transition-all duration-[120ms]',
              ready && !uploading
                ? 'bg-accent-bud text-fg-on-accent cursor-pointer hover:brightness-105 active:brightness-95'
                : 'bg-surface-sunken text-fg-disabled cursor-not-allowed',
            ].join(' ')}
          >
            {uploading ? '⏳ กำลังบันทึก…' : '💾 บันทึกลง DB →'}
          </button>
        </>
      }
    >
      <p className="text-small text-fg-secondary mb-4">
        ต้องครบ 12 ไฟล์: ZPM.xls + PM.xls + งบทำการ 10 ไฟล์
      </p>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragLeave={() => setDragOver(false)}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        className={[
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-4',
          'transition-colors duration-[120ms]',
          dragOver
            ? 'border-accent-bud bg-accent-bud-soft'
            : 'border-border-default bg-surface-sunken hover:border-border-strong',
        ].join(' ')}
      >
        <div className="text-[28px] mb-2">⊕</div>
        <p className="font-medium mb-1">ลากไฟล์มาวาง หรือคลิกเพื่อเลือก</p>
        <p className="text-caption text-fg-tertiary">
          รองรับ .xls · ตัวอย่าง: ZPM.xls, PM.xls, L301034000.xls, …
        </p>
        <input
          ref={inputRef}
          accept=".xls"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          className="hidden"
          type="file"
        />
      </div>

      {/* Status checklist */}
      <div className="bg-surface-sunken border border-border-subtle rounded-md px-4 py-3 mb-4">
        <p className="text-small font-semibold mb-2">สถานะไฟล์:</p>
        <StatusLine current={summary.zpm} label="ZPM" required={1} />
        <StatusLine current={summary.pm} label="PM" required={1} />
        <StatusLine
          current={budgetNames.size}
          label="งบทำการ"
          missing={missingBudget.slice(0, 3).join(', ')}
          required={10}
        />
        {summary.unknown > 0 && (
          <div className="text-caption text-status-danger pt-1">
            ⚠ มี {summary.unknown} ไฟล์ที่ระบบไม่รู้จัก
          </div>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div>
          <p className="text-small font-semibold mb-2">รายการไฟล์:</p>
          <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
            {files.map((file) => {
              const type = detectType(file)
              return (
                <div
                  key={file.name}
                  className="flex items-center gap-2 px-3 py-2 bg-surface-sunken rounded-md text-small"
                >
                  <code className="font-mono text-mono flex-1 truncate">{file.name}</code>
                  <FileBadge type={type} />
                  <span className="text-caption text-fg-tertiary min-w-[40px] text-right">
                    {Math.round(file.size / 1024)} KB
                  </span>
                  <button
                    aria-label={`ลบ ${file.name}`}
                    onClick={() => setFiles((p) => p.filter((f) => f.name !== file.name))}
                    type="button"
                    className="bg-transparent border-0 cursor-pointer text-fg-tertiary text-sm px-1 py-0.5 hover:text-status-danger transition-colors duration-[120ms] rounded"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Modal>
  )
}
