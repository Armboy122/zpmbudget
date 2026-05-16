export const ALL_DEPTS = ['ธุรการกอง', 'ผสม', 'ผอส', 'ผรผ', 'ผปค'] as const

export type DeptName = (typeof ALL_DEPTS)[number]

export type DeptAmount = {
  b?: number
  bud?: number
  z?: number
  zpm?: number
  total?: number
}

export type SpkItem = {
  s: string
  n: string
  w?: boolean
  tz?: number
  tb?: number
  d?: Partial<Record<DeptName, DeptAmount>>
}

export type DeptTotal = {
  bud: number
  zpm: number
  total: number
}

export type GrandTotals = DeptTotal & {
  budPct: number
  zpmPct: number
}

export type ValidationSummary = {
  zpm_rows?: number
  pm_orders?: number
  budget_files?: number
  zpm_total?: number
  dept_totals?: Partial<Record<DeptName, Partial<DeptTotal>>>
}

export type DashboardPayload = {
  spk_list: SpkItem[]
  validation?: ValidationSummary | null
  warnings?: string[]
}

export type SnapshotMeta = {
  id: string
  label: string
  createdAt?: string
  uploadedAt?: string
  fileCount?: number
  warningCount?: number
}

export type SnapshotRecord = SnapshotMeta &
  DashboardPayload & {
    raw?: unknown
  }

export type UploadSummary = {
  zpm: number
  pm: number
  budget: number
  unknown: number
}
