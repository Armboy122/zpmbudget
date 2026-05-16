'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmt } from '@/lib/format'
import { ALL_DEPTS, DeptName, DeptTotal } from '@/types/dashboard'

type Props = {
  deptTotals: Record<DeptName, DeptTotal>
}

function axisMoney(value: number | string) {
  const n = Number(value) || 0
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

function labelMoney(value: number | string | undefined) {
  if (!value) return ''
  const n = Number(value) || 0
  if (n === 0) return ''
  return fmt.bahtCompact(n)
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-border-default rounded-md p-3 shadow-md min-w-[180px]">
      <p className="text-small font-semibold mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4 text-caption">
          <span style={{ color: entry.color }} className="font-medium">{entry.name}</span>
          <span className="tabular font-semibold">{fmt.baht(entry.value)}</span>
        </div>
      ))}
      <div className="border-t border-border-subtle mt-2 pt-2 flex justify-between text-caption">
        <span className="text-fg-tertiary">รวม</span>
        <span className="tabular font-semibold">
          {fmt.baht((payload[0]?.value ?? 0) + (payload[1]?.value ?? 0))}
        </span>
      </div>
    </div>
  )
}

export function DeptBarChart({ deptTotals }: Props) {
  const data = ALL_DEPTS.map((dept) => ({
    dept,
    งบทำการ: deptTotals[dept]?.bud ?? 0,
    ZPM: deptTotals[dept]?.zpm ?? 0,
  }))

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <p className="text-kicker">Department Comparison</p>
        <div className="flex gap-3 ml-auto">
          <span className="flex items-center gap-1 text-caption">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-accent-bud" />
            งบทำการ
          </span>
          <span className="flex items-center gap-1 text-caption">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-accent-zpm" />
            ZPM
          </span>
        </div>
      </div>

      <h2 className="text-h2 font-semibold mb-4">
        งบทำการ vs ZPM ตามแผนก
      </h2>

      <p className="text-caption text-fg-tertiary mb-3">
        หน่วย: ล้านบาท
      </p>

      <ResponsiveContainer height={260} width="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 80, left: 8, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <XAxis
            axisLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            tickFormatter={axisMoney}
            tickLine={false}
            type="number"
          />
          <YAxis
            dataKey="dept"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-sans)' }}
            tickLine={false}
            type="category"
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-sunken)' }} />
          <Bar
            barSize={14}
            dataKey="งบทำการ"
            fill="var(--accent-bud)"
            radius={[0, 3, 3, 0]}
          >
            <LabelList
              content={(props) => {
                const { x, y, width, height, value } = props as {
                  x?: number; y?: number; width?: number; height?: number; value?: number
                }
                if (!value || !width || !height || !x || !y) return null
                return (
                  <text
                    dominantBaseline="middle"
                    fill="var(--text-secondary)"
                    fontSize={11}
                    textAnchor="start"
                    x={(x || 0) + (width || 0) + 6}
                    y={(y || 0) + (height || 0) / 2}
                  >
                    {labelMoney(value)}
                  </text>
                )
              }}
              dataKey="งบทำการ"
              position="right"
            />
          </Bar>
          <Bar
            barSize={14}
            dataKey="ZPM"
            fill="var(--accent-zpm)"
            radius={[0, 3, 3, 0]}
          >
            <LabelList
              content={(props) => {
                const { x, y, width, height, value } = props as {
                  x?: number; y?: number; width?: number; height?: number; value?: number
                }
                if (!value || !width || !height || !x || !y) return null
                return (
                  <text
                    dominantBaseline="middle"
                    fill="var(--text-secondary)"
                    fontSize={11}
                    textAnchor="start"
                    x={(x || 0) + (width || 0) + 6}
                    y={(y || 0) + (height || 0) / 2}
                  >
                    {labelMoney(value)}
                  </text>
                )
              }}
              dataKey="ZPM"
              position="right"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
