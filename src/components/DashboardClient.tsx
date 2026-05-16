'use client'

import { AdminUpload } from '@/components/AdminUpload'
import { BarChart } from '@/components/BarChart'
import { DeptTabs } from '@/components/DeptTabs'
import { MetricCards } from '@/components/MetricCards'
import { SnapshotPicker } from '@/components/SnapshotPicker'
import { SpkFilter } from '@/components/SpkFilter'
import { useZpmDashboard } from '@/hooks/useZpmDashboard'

function formatFull(value: number | undefined) {
  return Math.round(Number(value) || 0).toLocaleString('th-TH')
}

function formatDate(value?: string) {
  if (!value) return 'ไม่พบข้อมูลเวลา'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'medium' })
}

export function DashboardClient() {
  const dashboard = useZpmDashboard()
  const currentDate = dashboard.current?.createdAt || dashboard.current?.uploadedAt

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">PEA กฟภ. / กสฟ.</p>
          <h1>ZPM Budget Dashboard</h1>
          <span className="snapshot-time">Snapshot: {formatDate(currentDate)}</span>
        </div>
        <button className="btn btn-primary" onClick={() => dashboard.setAdminOpen(true)} type="button">
          Admin Upload
        </button>
      </header>

      <SnapshotPicker
        currentId={dashboard.current?.id}
        disabled={dashboard.loading}
        onReload={dashboard.loadLatest}
        onSelect={dashboard.selectSnapshot}
        snapshots={dashboard.snapshots}
      />

      {dashboard.error && <div className="alert error">{dashboard.error}</div>}
      {dashboard.warnings.map((message) => (
        <div className="alert warn" key={message}>
          {message}
        </div>
      ))}

      {dashboard.loading && !dashboard.current ? (
        <section className="empty-dashboard panel">
          <span className="spinner" />
          <strong>กำลังโหลด snapshot ล่าสุดจาก DB</strong>
        </section>
      ) : dashboard.spkList.length === 0 ? (
        <section className="empty-dashboard panel">
          <strong>ยังไม่มี snapshot ให้แสดง</strong>
          <span>เปิด Admin Upload เพื่ออัปโหลดไฟล์ครบชุดและบันทึกลง DB</span>
        </section>
      ) : (
        <>
          <MetricCards grandTotals={dashboard.grandTotals} topBudDept={dashboard.topBudDept} topZpmDept={dashboard.topZpmDept} />

          <section className="dashboard-grid">
            <div className="panel chart-panel">
              <div className="panel-head">
                <div>
                  <p className="section-kicker">Department Comparison</p>
                  <h2>งบทำการ vs ZPM ตามแผนก</h2>
                </div>
                <span className="selected-count">
                  {dashboard.checked.size}/{dashboard.spkList.length} สปก.
                </span>
              </div>
              <BarChart deptTotals={dashboard.deptTotals} />
            </div>

            <SpkFilter
              checked={dashboard.checked}
              selectGroup={dashboard.selectGroup}
              spkList={dashboard.spkList}
              toggleSpk={dashboard.toggleSpk}
            />
          </section>

          <DeptTabs
            activeDept={dashboard.activeDept}
            checked={dashboard.checked}
            deptTotals={dashboard.deptTotals}
            grandTotals={dashboard.grandTotals}
            setActiveDept={dashboard.setActiveDept}
            spkList={dashboard.spkList}
          />

          {dashboard.validation && (
            <details className="validation-panel">
              <summary>Validation summary</summary>
              <div className="validation-grid">
                <span>ZPM rows</span>
                <strong>{formatFull(dashboard.validation.zpm_rows)}</strong>
                <span>PM orders</span>
                <strong>{formatFull(dashboard.validation.pm_orders)}</strong>
                <span>Budget files</span>
                <strong>{formatFull(dashboard.validation.budget_files)}</strong>
                <span>ZPM total</span>
                <strong>฿{formatFull(dashboard.validation.zpm_total)}</strong>
              </div>
            </details>
          )}
        </>
      )}

      <AdminUpload
        onToggle={() => dashboard.setAdminOpen(!dashboard.adminOpen)}
        onUpload={dashboard.uploadSnapshot}
        open={dashboard.adminOpen}
        uploading={dashboard.uploading}
      />
    </main>
  )
}
