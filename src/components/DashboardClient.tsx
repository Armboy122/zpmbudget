'use client'

import { useEffect, useState } from 'react'
import { AdminUploadModal } from '@/components/admin/AdminUploadModal'
import { DeptBarChart } from '@/components/chart/DeptBarChart'
import { SpkFilter } from '@/components/filter/SpkFilter'
import { HeroMetric } from '@/components/metrics/HeroMetric'
import { MetricCard } from '@/components/metrics/MetricCard'
import { AppHeader } from '@/components/shell/AppHeader'
import { SnapshotBar } from '@/components/shell/SnapshotBar'
import { DeptDetailTable } from '@/components/table/DeptDetailTable'
import { OverviewTable } from '@/components/table/OverviewTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { fmt } from '@/lib/format'
import { ALL_DEPTS, type DeptName } from '@/types/dashboard'
import { useZpmDashboard } from '@/hooks/useZpmDashboard'

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton height={56} />
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={120} />
        ))}
      </div>
      <div className="grid grid-cols-[3fr_2fr] gap-4">
        <Skeleton height={320} />
        <Skeleton height={320} />
      </div>
      <Skeleton height={400} />
    </div>
  )
}

function EmptyState({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center bg-surface-card border border-border-subtle rounded-lg shadow-card">
      <div className="text-5xl mb-4 opacity-40">📊</div>
      <h2 className="text-h2 font-semibold mb-2">ยังไม่มี snapshot ให้แสดง</h2>
      <p className="text-small text-fg-tertiary mb-6">
        อัปโหลดไฟล์ครบชุดเพื่อเริ่มต้นใช้งาน Dashboard
      </p>
      <button
        onClick={onOpenAdmin}
        className="h-10 px-6 rounded-md bg-accent-bud text-fg-on-accent font-semibold text-body cursor-pointer border-none hover:opacity-90 transition-opacity duration-[120ms]"
        type="button"
      >
        เปิด Admin Upload
      </button>
    </div>
  )
}

const alertVariants = {
  error: 'bg-status-danger-bg border-l-4 border-l-status-danger',
  warn:  'bg-status-warning-bg border-l-4 border-l-status-warning',
  info:  'bg-status-info-bg border-l-4 border-l-status-info',
} as const

const alertIcons = { error: '✕', warn: '⚠', info: 'ℹ' } as const

function Alert({ type, children }: { type: keyof typeof alertVariants; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-md text-small mb-3 ${alertVariants[type]}`}>
      <span>{alertIcons[type]}</span>
      <span>{children}</span>
    </div>
  )
}

export function DashboardClient() {
  const dashboard = useZpmDashboard()
  const [activeTab, setActiveTab] = useState<DeptName | 'all'>('all')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (e.key === '/') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('[aria-label="ค้นหา สปก."]')?.focus()
      }
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) dashboard.loadLatest()
      if ((e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey) dashboard.setAdminOpen(true)
      if (e.key === 'Escape') dashboard.setAdminOpen(false)
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= ALL_DEPTS.length + 1) {
        const tabs: Array<DeptName | 'all'> = ['all', ...ALL_DEPTS]
        const target = tabs[num - 1]
        if (target) setActiveTab(target)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dashboard])

  return (
    <main className="app-shell">
      <AppHeader
        current={dashboard.current}
        loading={dashboard.loading}
        onOpenAdmin={() => dashboard.setAdminOpen(true)}
      />

      <SnapshotBar
        currentId={dashboard.current?.id}
        deptCount={ALL_DEPTS.length}
        disabled={dashboard.loading}
        onReload={dashboard.loadLatest}
        onSelect={dashboard.selectSnapshot}
        snapshots={dashboard.snapshots}
        spkCount={dashboard.spkList.length}
      />

      {dashboard.error && <Alert type="error">{dashboard.error}</Alert>}
      {dashboard.warnings.map((msg) => <Alert key={msg} type="warn">{msg}</Alert>)}

      {dashboard.loading && !dashboard.current ? (
        <DashboardSkeleton />
      ) : dashboard.spkList.length === 0 ? (
        <EmptyState onOpenAdmin={() => dashboard.setAdminOpen(true)} />
      ) : (
        <>
          {/* Metric cards: 1 hero + 4 supporting */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 mb-6">
            <HeroMetric
              deptCount={ALL_DEPTS.length}
              grandTotals={dashboard.grandTotals}
              spkCount={dashboard.checked.size}
            />
            <MetricCard accentColor="bud" label="งบทำการ"
              sub={`${fmt.pctInt(dashboard.grandTotals.budPct)} ของรวม`}
              value={fmt.bahtCompact(dashboard.grandTotals.bud)} />
            <MetricCard accentColor="zpm" label="ZPM"
              sub={`${fmt.pctInt(dashboard.grandTotals.zpmPct)} ของรวม`}
              value={fmt.bahtCompact(dashboard.grandTotals.zpm)} />
            <MetricCard accentColor="bud" label="สูงสุด งบทำการ"
              sub={fmt.bahtCompact(dashboard.topBudDept.amount)}
              value={dashboard.topBudDept.dept} />
            <MetricCard accentColor="zpm" label="สูงสุด ZPM"
              sub={fmt.bahtCompact(dashboard.topZpmDept.amount)}
              value={dashboard.topZpmDept.dept} />
          </div>

          {/* Chart + Filter */}
          <div className="grid grid-cols-[3fr_2fr] gap-4 mb-6 items-start">
            <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card p-6">
              <DeptBarChart deptTotals={dashboard.deptTotals} />
            </div>
            <SpkFilter
              checked={dashboard.checked}
              selectGroup={dashboard.selectGroup}
              spkList={dashboard.spkList}
              toggleSpk={dashboard.toggleSpk}
            />
          </div>

          {/* Dept tabs + table */}
          <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card overflow-hidden mb-6">
            <div className="flex overflow-x-auto border-b border-border-subtle px-4 bg-surface-sunken">
              {(['all', ...ALL_DEPTS] as Array<DeptName | 'all'>).map((dept) => {
                const isActive = activeTab === dept
                const label = dept === 'all' ? 'ภาพรวม' : dept
                const count = dept === 'all'
                  ? ALL_DEPTS.length
                  : dashboard.spkList.filter((s) => dashboard.checked.has(s.s) && s.d?.[dept]).length
                return (
                  <button
                    key={dept}
                    onClick={() => setActiveTab(dept)}
                    className={[
                      'flex items-center gap-1 px-4 py-3 whitespace-nowrap text-small bg-transparent cursor-pointer border-0 border-b-[3px]',
                      isActive
                        ? 'border-b-accent-bud text-accent-bud font-semibold'
                        : 'border-b-transparent text-fg-secondary font-normal',
                    ].join(' ')}
                    type="button"
                  >
                    {label}
                    <span className={[
                      'text-kicker font-semibold rounded-pill px-[5px] py-px',
                      isActive ? 'text-accent-bud bg-accent-bud-soft' : 'text-fg-tertiary bg-transparent',
                    ].join(' ')}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div>
              {activeTab === 'all' ? (
                <OverviewTable deptTotals={dashboard.deptTotals} grandTotals={dashboard.grandTotals} />
              ) : (
                <DeptDetailTable activeDept={activeTab} checked={dashboard.checked} spkList={dashboard.spkList} />
              )}
            </div>

            <div className="px-4 py-3 border-t border-border-subtle bg-surface-sunken flex justify-between text-caption text-fg-tertiary">
              <span>
                {activeTab === 'all'
                  ? `ภาพรวม ${dashboard.checked.size} สปก.`
                  : `${activeTab} · ${dashboard.checked.size} สปก.`}
              </span>
              <strong className="tabular tabular-nums font-mono text-fg-primary">
                รวม {fmt.baht(activeTab === 'all' ? dashboard.grandTotals.total : (dashboard.deptTotals[activeTab]?.total ?? 0))}
              </strong>
            </div>
          </div>

          {/* Validation */}
          {dashboard.validation && (
            <details className="bg-surface-card border border-border-subtle rounded-lg mb-6">
              <summary className="px-5 py-3 cursor-pointer text-small font-medium text-fg-secondary">
                ▸ Validation summary
              </summary>
              <div className="grid grid-cols-4 gap-4 px-5 py-4 border-t border-border-subtle">
                {[
                  { label: 'ZPM rows', value: dashboard.validation.zpm_rows },
                  { label: 'PM orders', value: dashboard.validation.pm_orders },
                  { label: 'Budget files', value: dashboard.validation.budget_files },
                  { label: 'ZPM total', value: dashboard.validation.zpm_total ? fmt.baht(dashboard.validation.zpm_total) : undefined },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-caption text-fg-tertiary mb-0.5">{label}</p>
                    <strong className="tabular tabular-nums">{value ?? '—'}</strong>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}

      <AdminUploadModal
        onClose={() => dashboard.setAdminOpen(false)}
        onUpload={dashboard.uploadSnapshot}
        open={dashboard.adminOpen}
        uploading={dashboard.uploading}
      />
    </main>
  )
}
