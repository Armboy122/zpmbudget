'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ALL_DEPTS, DashboardPayload, DeptName, SnapshotMeta, SnapshotRecord, SpkItem } from '@/types/dashboard'

const SNAPSHOT_LIST_ENDPOINTS = ['/api/snapshots']
const LATEST_ENDPOINTS = ['/api/snapshots/latest']
const UPLOAD_ENDPOINTS = ['/api/upload']

function roundMoney(value: number) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return undefined
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number') return value
  }
  return undefined
}

async function getJson(endpoint: string) {
  const res = await fetch(endpoint, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${endpoint} ${res.status}`)
  return res.json()
}

async function postFiles(endpoint: string, files: File[]) {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  const res = await fetch(endpoint, { method: 'POST', body: form })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || data?.detail || data?.message || `${endpoint} ${res.status}`)
  return data
}

async function firstSuccessful<T>(items: string[], run: (endpoint: string) => Promise<T>) {
  const errors: string[] = []
  for (const endpoint of items) {
    try {
      return await run(endpoint)
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }
  throw new Error(errors[0] || 'ไม่พบ API ที่พร้อมใช้งาน')
}

function asRecord(input: unknown): Record<string, unknown> {
  return (input ?? {}) as Record<string, unknown>
}

function unwrapPayload(input: unknown): DashboardPayload {
  const root = (input ?? {}) as Record<string, unknown>
  const nested = asRecord(root.snapshot || root.data || root.payload)
  const nestedPayload = asRecord(nested.payload)
  const rootPayload = asRecord(root.payload)
  const source = Array.isArray(root.spk_list)
    ? root
    : Array.isArray(rootPayload.spk_list)
      ? rootPayload
      : Array.isArray(nested.spk_list)
        ? nested
        : Array.isArray(nestedPayload.spk_list)
          ? nestedPayload
          : root

  return {
    spk_list: Array.isArray(source.spk_list) ? (source.spk_list as SpkItem[]) : [],
    validation: (source.validation as DashboardPayload['validation']) || (nested.validation as DashboardPayload['validation']) || null,
    warnings: Array.isArray(source.warnings) ? (source.warnings as string[]) : Array.isArray(nested.warnings) ? (nested.warnings as string[]) : [],
  }
}

function normalizeSnapshot(input: unknown, fallbackId = 'latest'): SnapshotRecord {
  const root = (input ?? {}) as Record<string, unknown>
  const payload = unwrapPayload(input)
  const nested = (root.snapshot || root.data || root.payload) as Record<string, unknown> | undefined
  const metaSource = nested && !Array.isArray(nested.spk_list) ? { ...root, ...nested } : root
  const id = readString(metaSource, ['id', 'snapshotId', 'snapshot_id']) || String(readNumber(metaSource, ['id', 'snapshotId', 'snapshot_id']) ?? fallbackId)
  const createdAt = readString(metaSource, ['createdAt', 'created_at', 'created', 'timestamp'])
  const uploadedAt = readString(metaSource, ['uploadedAt', 'uploaded_at', 'uploaded', 'uploadDate', 'upload_date'])
  const label = readString(metaSource, ['label', 'name', 'title']) || formatSnapshotLabel({ id, createdAt, uploadedAt })

  return {
    id,
    label,
    createdAt,
    uploadedAt,
    fileCount:
      readNumber(metaSource, ['fileCount', 'file_count', 'files']) ||
      (Array.isArray(metaSource.uploadedFileNames) ? metaSource.uploadedFileNames.length : undefined),
    warningCount: payload.warnings?.length,
    spk_list: payload.spk_list,
    validation: payload.validation,
    warnings: payload.warnings,
    raw: input,
  }
}

function normalizeSnapshotList(input: unknown): SnapshotMeta[] {
  const root = (input ?? {}) as Record<string, unknown>
  const list = Array.isArray(input)
    ? input
    : Array.isArray(root.snapshots)
      ? root.snapshots
      : Array.isArray(root.data)
        ? root.data
        : []

  return list.map((item, index) => {
    const snapshot = normalizeSnapshot(item, `snapshot-${index}`)
    return {
      id: snapshot.id,
      label: snapshot.label,
      createdAt: snapshot.createdAt,
      uploadedAt: snapshot.uploadedAt,
      fileCount: snapshot.fileCount,
      warningCount: snapshot.warningCount,
    }
  })
}

function formatDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatSnapshotLabel(meta: Pick<SnapshotMeta, 'createdAt' | 'uploadedAt' | 'id'>) {
  const date = formatDate(meta.createdAt || meta.uploadedAt)
  return date || `Snapshot ${meta.id}`
}

function emptyDeptTotals() {
  return ALL_DEPTS.reduce(
    (acc, dept) => {
      acc[dept] = { bud: 0, zpm: 0, total: 0 }
      return acc
    },
    {} as Record<DeptName, { bud: number; zpm: number; total: number }>,
  )
}

function detailEndpoints(id: string) {
  return [`/api/snapshots/${encodeURIComponent(id)}`, `/api/snapshot/${encodeURIComponent(id)}`]
}

export function useZpmDashboard() {
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([])
  const [current, setCurrent] = useState<SnapshotRecord | null>(null)
  const [checked, setChecked] = useState<Set<string>>(() => new Set())
  const [activeDept, setActiveDept] = useState<DeptName | 'all'>('all')
  const [adminOpen, setAdminOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const loadSnapshotList = useCallback(async () => {
    const data = await firstSuccessful(SNAPSHOT_LIST_ENDPOINTS, getJson)
    const list = normalizeSnapshotList(data)
    setSnapshots(list)
    return list
  }, [])

  const applySnapshot = useCallback((snapshot: SnapshotRecord) => {
    const list = Array.isArray(snapshot.spk_list) ? snapshot.spk_list : []
    setCurrent(snapshot)
    setChecked(new Set(list.map((item) => item.s)))
    setActiveDept('all')
  }, [])

  const loadLatest = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [latest] = await Promise.allSettled([
        firstSuccessful(LATEST_ENDPOINTS, getJson),
        loadSnapshotList().catch(() => []),
      ])
      if (latest.status === 'fulfilled') {
        applySnapshot(normalizeSnapshot(latest.value))
        return
      }
      const list = await loadSnapshotList()
      if (list[0]) {
        const detail = await firstSuccessful(detailEndpoints(list[0].id), getJson)
        applySnapshot(normalizeSnapshot(detail, list[0].id))
        return
      }
      setCurrent(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'โหลด snapshot ล่าสุดไม่สำเร็จ')
      setCurrent(null)
    } finally {
      setLoading(false)
    }
  }, [applySnapshot, loadSnapshotList])

  const selectSnapshot = useCallback(
    async (id: string) => {
      setLoading(true)
      setError('')
      try {
        const data = await firstSuccessful(detailEndpoints(id), getJson)
        applySnapshot(normalizeSnapshot(data, id))
      } catch (error) {
        setError(error instanceof Error ? error.message : 'โหลด snapshot ที่เลือกไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    },
    [applySnapshot],
  )

  const uploadSnapshot = useCallback(
    async (files: File[]) => {
      if (!files.length) return
      setUploading(true)
      setError('')
      try {
        const data = await firstSuccessful(UPLOAD_ENDPOINTS, (endpoint) => postFiles(endpoint, files))
        const snapshot = normalizeSnapshot(data, `upload-${Date.now()}`)
        snapshot.uploadedAt ||= new Date().toISOString()
        snapshot.fileCount ||= files.length
        applySnapshot(snapshot)
        await loadSnapshotList().catch(() => {
          setSnapshots((prev) => {
            if (prev.some((item) => item.id === snapshot.id)) return prev
            return [snapshot, ...prev]
          })
        })
        setAdminOpen(false)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'อัปโหลดและบันทึก DB ไม่สำเร็จ')
      } finally {
        setUploading(false)
      }
    },
    [applySnapshot, loadSnapshotList],
  )

  useEffect(() => {
    void loadLatest()
  }, [loadLatest])

  const spkList = current?.spk_list ?? []
  const warnings = current?.warnings ?? []
  const validation = current?.validation ?? null

  const deptTotals = useMemo(() => {
    const totals = emptyDeptTotals()
    for (const item of spkList) {
      if (!checked.has(item.s)) continue
      for (const dept of ALL_DEPTS) {
        const deptData = item.d?.[dept]
        if (!deptData) continue
        totals[dept].bud += Number(deptData.b ?? deptData.bud) || 0
        totals[dept].zpm += Number(deptData.z ?? deptData.zpm) || 0
      }
    }
    for (const dept of ALL_DEPTS) {
      totals[dept].bud = roundMoney(totals[dept].bud)
      totals[dept].zpm = roundMoney(totals[dept].zpm)
      totals[dept].total = roundMoney(totals[dept].bud + totals[dept].zpm)
    }
    return totals
  }, [checked, spkList])

  const grandTotals = useMemo(() => {
    const totals = ALL_DEPTS.reduce(
      (acc, dept) => {
        acc.bud += deptTotals[dept].bud
        acc.zpm += deptTotals[dept].zpm
        return acc
      },
      { bud: 0, zpm: 0, total: 0, budPct: 0, zpmPct: 0 },
    )
    totals.bud = roundMoney(totals.bud)
    totals.zpm = roundMoney(totals.zpm)
    totals.total = roundMoney(totals.bud + totals.zpm)
    totals.budPct = totals.total ? (totals.bud / totals.total) * 100 : 0
    totals.zpmPct = totals.total ? (totals.zpm / totals.total) * 100 : 0
    return totals
  }, [deptTotals])

  const topBudDept = useMemo(
    () =>
      ALL_DEPTS.reduce(
        (leader, dept) => (deptTotals[dept].bud > leader.amount ? { dept, amount: deptTotals[dept].bud } : leader),
        { dept: '-', amount: 0 },
      ),
    [deptTotals],
  )

  const topZpmDept = useMemo(
    () =>
      ALL_DEPTS.reduce(
        (leader, dept) => (deptTotals[dept].zpm > leader.amount ? { dept, amount: deptTotals[dept].zpm } : leader),
        { dept: '-', amount: 0 },
      ),
    [deptTotals],
  )

  const toggleSpk = useCallback((code: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }, [])

  const selectGroup = useCallback(
    (group: 'all' | 'none' | 'nowelfare' | 'zpmonly') => {
      if (group === 'none') setChecked(new Set())
      else if (group === 'nowelfare') setChecked(new Set(spkList.filter((item) => !item.w).map((item) => item.s)))
      else if (group === 'zpmonly') setChecked(new Set(spkList.filter((item) => (Number(item.tz) || 0) > 0).map((item) => item.s)))
      else setChecked(new Set(spkList.map((item) => item.s)))
    },
    [spkList],
  )

  return {
    activeDept,
    adminOpen,
    checked,
    current,
    deptTotals,
    error,
    grandTotals,
    loading,
    snapshots,
    spkList,
    topBudDept,
    topZpmDept,
    uploading,
    validation,
    warnings,
    loadLatest,
    selectGroup,
    selectSnapshot,
    setActiveDept,
    setAdminOpen,
    toggleSpk,
    uploadSnapshot,
  }
}
