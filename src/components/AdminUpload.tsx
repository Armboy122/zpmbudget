'use client'

import { useMemo, useRef, useState } from 'react'
import { UploadSummary } from '@/types/dashboard'

const REQUIRED_BUDGET_FILES = new Set([
  'l301034000.xls',
  'l301034001.xls',
  'l301034010.xls',
  'l301034011.xls',
  'l301034020.xls',
  'l301034021.xls',
  'l301034030.xls',
  'l301034031.xls',
  'l301034040.xls',
  'l301034041.xls',
])

function detectLocalType(file: File) {
  const name = file.name.toLowerCase()
  if (name === 'zpm.xls' || name.includes('zpm')) return 'ZPM'
  if (name === 'pm.xls' || name.includes('pm')) return 'PM'
  if (/l301034\d+/.test(name)) return 'งบทำการ'
  return 'รอตรวจจากระบบ'
}

function summarize(files: File[]): UploadSummary {
  return files.reduce(
    (acc, file) => {
      const type = detectLocalType(file)
      if (type === 'ZPM') acc.zpm += 1
      else if (type === 'PM') acc.pm += 1
      else if (type === 'งบทำการ') acc.budget += 1
      else acc.unknown += 1
      return acc
    },
    { zpm: 0, pm: 0, budget: 0, unknown: 0 },
  )
}

type Props = {
  open: boolean
  uploading: boolean
  onToggle: () => void
  onUpload: (files: File[]) => void
}

export function AdminUpload({ onToggle, onUpload, open, uploading }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const summary = useMemo(() => summarize(files), [files])
  const budgetFileNames = useMemo(() => new Set(files.map((file) => file.name.toLowerCase()).filter((name) => REQUIRED_BUDGET_FILES.has(name))), [files])
  const hasZpm = files.some((file) => file.name.toLowerCase() === 'zpm.xls')
  const hasPm = files.some((file) => file.name.toLowerCase() === 'pm.xls')
  const ready = hasZpm && hasPm && budgetFileNames.size === REQUIRED_BUDGET_FILES.size && files.length === 12 && summary.unknown === 0
  const missingCount = (hasZpm ? 0 : 1) + (hasPm ? 0 : 1) + (REQUIRED_BUDGET_FILES.size - budgetFileNames.size)

  function addFiles(nextFiles: FileList | null) {
    const incoming = Array.from(nextFiles || [])
    if (incoming.length === 0) return
    setFiles((prev) => {
      const byKey = new Map(prev.map((file) => [`${file.name}:${file.size}`, file]))
      incoming.forEach((file) => byKey.set(`${file.name}:${file.size}`, file))
      return Array.from(byKey.values())
    })
  }

  return (
    <section className={`admin-dock ${open ? 'open' : ''}`}>
      <button className="admin-toggle" onClick={onToggle} type="button">
        <span>Admin Upload</span>
        <b>{open ? 'ปิด' : 'เปิด'}</b>
      </button>

      {open && (
        <div className="admin-panel">
          <button
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragOver(false)
              addFiles(event.dataTransfer.files)
            }}
            type="button"
          >
            <span className="drop-icon">+</span>
            <strong>อัปโหลดไฟล์ครบชุดเพื่อ save DB</strong>
            <small>ต้องครบ 12 ไฟล์: ZPM, PM และงบทำการ L301034xxx ทั้ง 10 ไฟล์</small>
          </button>
          <input ref={inputRef} hidden multiple type="file" accept=".xls,.tsv,.txt" onChange={(event) => addFiles(event.target.files)} />

          <div className="upload-summary">
            <span className={summary.zpm ? 'ok' : ''}>ZPM: {summary.zpm}</span>
            <span className={summary.pm ? 'ok' : ''}>PM: {summary.pm}</span>
            <span className={budgetFileNames.size === REQUIRED_BUDGET_FILES.size ? 'ok' : ''}>งบทำการ: {budgetFileNames.size}/10</span>
            {summary.unknown > 0 && <span>อื่น ๆ: {summary.unknown}</span>}
          </div>

          {files.length > 0 && (
            <div className="file-list">
              {files.map((file) => (
                <div className="file-row" key={`${file.name}:${file.size}`}>
                  <span className="file-type">{detectLocalType(file)}</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{Math.ceil(file.size / 1024).toLocaleString('th-TH')} KB</span>
                </div>
              ))}
            </div>
          )}

          <div className="upload-actions">
            {!ready && files.length > 0 && <span className="upload-hint">ยังไม่ครบชุด เหลือ {missingCount} ไฟล์ที่จำเป็น และต้องไม่มีไฟล์เกิน/ซ้ำ</span>}
            <button className="btn" disabled={uploading || files.length === 0} onClick={() => setFiles([])} type="button">
              ล้างรายการ
            </button>
            <button className="btn btn-primary" disabled={uploading || !ready} onClick={() => onUpload(files)} type="button">
              {uploading ? <span className="spinner" /> : null}
              Save DB
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
