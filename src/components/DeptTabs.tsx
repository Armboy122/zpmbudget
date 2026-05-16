import { ALL_DEPTS, DeptName, DeptTotal, GrandTotals, SpkItem } from '@/types/dashboard'

const DEPT_OPTIONS: Array<DeptName | 'all'> = ['all', ...ALL_DEPTS]

function money(value: number) {
  return `฿${Math.round(Number(value) || 0).toLocaleString('th-TH')}`
}

function pct(value: number) {
  return `${Math.round(Number.isFinite(value) ? value : 0)}%`
}

function OverviewTable({ deptTotals, grandTotals }: { deptTotals: Record<DeptName, DeptTotal>; grandTotals: GrandTotals }) {
  return (
    <div className="table-container">
      <div className="trow thead overview-grid">
        <span>แผนก</span>
        <span>สัดส่วน</span>
        <span>งบทำการ</span>
        <span>ZPM</span>
        <span>รวม</span>
      </div>
      {ALL_DEPTS.map((dept) => {
        const row = deptTotals[dept]
        const totalPct = grandTotals.total ? (row.total / grandTotals.total) * 100 : 0
        const budPct = row.total ? (row.bud / row.total) * 100 : 0
        const zpmPct = row.total ? (row.zpm / row.total) * 100 : 0

        return (
          <div className="trow overview-grid" key={dept}>
            <strong>{dept}</strong>
            <div className="share-cell">
              <div className="stacked-bar">
                <span className="bud-segment" style={{ width: `${Math.min(budPct, 100)}%` }} />
                <span className="zpm-segment" style={{ width: `${Math.min(zpmPct, 100)}%` }} />
              </div>
              <small>
                {pct(totalPct)} ของทั้งหมด · งบทำการ {pct(budPct)} ZPM {pct(zpmPct)}
              </small>
            </div>
            <span>{money(row.bud)}</span>
            <span className="zpm-text">{money(row.zpm)}</span>
            <strong>{money(row.total)}</strong>
          </div>
        )
      })}
    </div>
  )
}

function DeptTable({ activeDept, checked, spkList }: { activeDept: DeptName; checked: Set<string>; spkList: SpkItem[] }) {
  const rows = spkList
    .filter((item) => checked.has(item.s) && item.d?.[activeDept])
    .map((item) => {
      const deptData = item.d?.[activeDept]
      const bud = Number(deptData?.b ?? deptData?.bud) || 0
      const zpm = Number(deptData?.z ?? deptData?.zpm) || 0
      const total = bud + zpm
      return { item, bud, zpm, total, zpmPct: total ? (zpm / total) * 100 : 0 }
    })
    .sort((a, b) => b.total - a.total)

  return (
    <div className="table-container">
      <div className="trow thead detail-grid">
        <span>รหัส สปก.</span>
        <span>ชื่อบัญชี</span>
        <span>งบทำการ</span>
        <span>ZPM</span>
        <span>%</span>
      </div>
      {rows.map(({ item, bud, zpm, zpmPct }) => (
        <div className="trow detail-grid" key={item.s}>
          <code>{item.s}</code>
          <span className="account-name">
            {item.n}
            {item.w && <em>สวัสดิการ</em>}
          </span>
          <span>{money(bud)}</span>
          <span className="zpm-text">{money(zpm)}</span>
          <strong>{pct(zpmPct)}</strong>
        </div>
      ))}
      {rows.length === 0 && <div className="empty-state">ไม่มีรายการในตัวกรองนี้</div>}
    </div>
  )
}

type Props = {
  activeDept: DeptName | 'all'
  checked: Set<string>
  deptTotals: Record<DeptName, DeptTotal>
  grandTotals: GrandTotals
  setActiveDept: (dept: DeptName | 'all') => void
  spkList: SpkItem[]
}

export function DeptTabs({ activeDept, checked, deptTotals, grandTotals, setActiveDept, spkList }: Props) {
  const currentRows =
    activeDept === 'all' ? ALL_DEPTS.length : spkList.filter((item) => checked.has(item.s) && item.d?.[activeDept]).length
  const currentTotal = activeDept === 'all' ? grandTotals.total : deptTotals[activeDept]?.total || 0
  const filterText = activeDept === 'all' ? `ภาพรวม ${checked.size} สปก.` : `${activeDept} · ${checked.size} สปก. ที่เลือก`

  return (
    <section className="panel dept-panel">
      <div className="tabs">
        {DEPT_OPTIONS.map((dept) => (
          <button className={`tab-btn ${activeDept === dept ? 'active' : ''}`} key={dept} onClick={() => setActiveDept(dept)} type="button">
            {dept === 'all' ? 'ภาพรวม' : dept}
          </button>
        ))}
      </div>

      {activeDept === 'all' ? (
        <OverviewTable deptTotals={deptTotals} grandTotals={grandTotals} />
      ) : (
        <DeptTable activeDept={activeDept} checked={checked} spkList={spkList} />
      )}

      <footer className="table-footer">
        <span>
          {filterText} · {currentRows} แถว
        </span>
        <strong>{money(currentTotal)}</strong>
      </footer>
    </section>
  )
}
