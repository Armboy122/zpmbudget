import { GrandTotals } from '@/types/dashboard'

function compactMoney(value: number) {
  const amount = Math.round(Number(value) || 0)
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${(amount / 1_000).toFixed(1)}k`
  return amount.toLocaleString('th-TH')
}

function pct(value: number) {
  return `${Math.round(Number(value) || 0)}%`
}

function MetricCard({ accent, label, value, sub }: { accent?: string; label: string; value: string; sub: string }) {
  return (
    <article className="metric-card" style={accent ? ({ '--accent': accent } as React.CSSProperties) : undefined}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="sub">{sub}</div>
    </article>
  )
}

type Props = {
  grandTotals: GrandTotals
  topBudDept: { dept: string; amount: number }
  topZpmDept: { dept: string; amount: number }
}

export function MetricCards({ grandTotals, topBudDept, topZpmDept }: Props) {
  return (
    <section className="metric-grid">
      <MetricCard label="งบรวม (เลือกแล้ว)" sub="งบทำการ + ZPM" value={`฿${compactMoney(grandTotals.total)}`} />
      <MetricCard
        accent="#378add"
        label="งบทำการ"
        sub={`${pct(grandTotals.budPct)} ของทั้งหมด`}
        value={`฿${compactMoney(grandTotals.bud)}`}
      />
      <MetricCard accent="#1d9e75" label="ZPM" sub={`${pct(grandTotals.zpmPct)} ของทั้งหมด`} value={`฿${compactMoney(grandTotals.zpm)}`} />
      <MetricCard accent="#7aa7ff" label="สูงสุด (งบทำการ)" sub={`฿${compactMoney(topBudDept.amount)}`} value={topBudDept.dept} />
      <MetricCard accent="#1d9e75" label="สูงสุด (ZPM)" sub={`฿${compactMoney(topZpmDept.amount)}`} value={topZpmDept.dept} />
    </section>
  )
}
