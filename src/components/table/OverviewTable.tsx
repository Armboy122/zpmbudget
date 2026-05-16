'use client'

import { useState } from 'react'
import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from '@tremor/react'
import { fmt } from '@/lib/format'
import { ALL_DEPTS, type DeptName, type DeptTotal, type GrandTotals } from '@/types/dashboard'

type SortKey = 'dept' | 'bud' | 'zpm' | 'total'
type SortDir = 'asc' | 'desc'

type Props = {
  deptTotals: Record<DeptName, DeptTotal>
  grandTotals: GrandTotals
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="opacity-30 ml-1">↕</span>
  return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

export function OverviewTable({ deptTotals, grandTotals }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...ALL_DEPTS].sort((a, b) => {
    const va = sortKey === 'dept' ? a : deptTotals[a][sortKey]
    const vb = sortKey === 'dept' ? b : deptTotals[b][sortKey]
    const cmp = typeof va === 'string'
      ? va.localeCompare(vb as string, 'th')
      : (va as number) - (vb as number)
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div className="overflow-x-auto">
      <Table>
        <colgroup>
          <col style={{ width: '16%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '18%' }} />
          <col style={{ width: '18%' }} />
          <col style={{ width: '18%' }} />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableHeaderCell
              onClick={() => handleSort('dept')}
              className="sticky top-0 z-10 bg-surface-sunken text-caption font-semibold text-fg-secondary border-b-2 border-border-default whitespace-nowrap cursor-pointer select-none text-left"
            >
              แผนก <SortIcon active={sortKey === 'dept'} dir={sortDir} />
            </TableHeaderCell>
            <TableHeaderCell
              className="sticky top-0 z-10 bg-surface-sunken text-caption font-semibold text-fg-secondary border-b-2 border-border-default whitespace-nowrap cursor-default select-none text-left"
            >
              สัดส่วน
            </TableHeaderCell>
            <TableHeaderCell
              onClick={() => handleSort('bud')}
              className="sticky top-0 z-10 bg-surface-sunken text-caption font-semibold text-fg-secondary border-b-2 border-border-default whitespace-nowrap cursor-pointer select-none text-right"
            >
              งบทำการ <SortIcon active={sortKey === 'bud'} dir={sortDir} />
            </TableHeaderCell>
            <TableHeaderCell
              onClick={() => handleSort('zpm')}
              className="sticky top-0 z-10 bg-surface-sunken text-caption font-semibold text-fg-secondary border-b-2 border-border-default whitespace-nowrap cursor-pointer select-none text-right"
            >
              ZPM <SortIcon active={sortKey === 'zpm'} dir={sortDir} />
            </TableHeaderCell>
            <TableHeaderCell
              onClick={() => handleSort('total')}
              className="sticky top-0 z-10 bg-surface-sunken text-caption font-semibold text-fg-secondary border-b-2 border-border-default whitespace-nowrap cursor-pointer select-none text-right"
            >
              รวม <SortIcon active={sortKey === 'total'} dir={sortDir} />
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((dept, i) => {
            const row = deptTotals[dept]
            const totalPct = grandTotals.total ? (row.total / grandTotals.total) * 100 : 0
            const budPct = row.total ? (row.bud / row.total) * 100 : 0
            const zpmPct = row.total ? (row.zpm / row.total) * 100 : 0
            const highZpm = zpmPct > 30

            return (
              <TableRow
                key={dept}
                className={[
                  i % 2 === 0 ? 'bg-surface-card' : 'bg-surface-sunken',
                  'hover:outline hover:outline-2 hover:outline-border-strong hover:-outline-offset-2',
                ].join(' ')}
              >
                <TableCell className="text-body font-medium align-middle">
                  {dept}
                </TableCell>
                <TableCell className="text-body align-middle">
                  <div className="flex flex-col gap-[3px]">
                    <div className="h-1.5 rounded-pill bg-border-subtle overflow-hidden flex">
                      <span
                        className="bg-accent-bud"
                        style={{ width: `${Math.min(budPct, 100)}%` }}
                      />
                      <span
                        className="bg-accent-zpm"
                        style={{ width: `${Math.min(zpmPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-caption text-fg-tertiary">
                      {fmt.pctInt(totalPct)} ของทั้งหมด · งบ {fmt.pctInt(budPct)} · ZPM {fmt.pctInt(zpmPct)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="tabular-nums text-body text-right font-mono text-accent-bud-strong align-middle">
                  {fmt.baht(row.bud)}
                </TableCell>
                <TableCell className="tabular-nums text-body text-right font-mono text-accent-zpm-strong align-middle">
                  {fmt.baht(row.zpm)}
                  {highZpm && (
                    <Badge
                      className="mt-0.5 block text-center text-kicker font-semibold text-status-warning bg-status-warning-bg rounded-pill px-[5px] py-[1px] font-sans"
                    >
                      ZPM สูง
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="tabular-nums text-body text-right font-semibold font-mono align-middle">
                  {fmt.baht(row.total)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <tfoot>
          <tr className="bg-accent-bud-soft border-t-2 border-accent-bud">
            <td
              colSpan={2}
              className="px-3 py-2 text-body font-bold align-middle"
            >
              TOTAL
            </td>
            <td className="tabular-nums px-3 py-2 text-body text-right font-bold font-mono text-accent-bud-strong align-middle">
              {fmt.baht(grandTotals.bud)}
            </td>
            <td className="tabular-nums px-3 py-2 text-body text-right font-bold font-mono text-accent-zpm-strong align-middle">
              {fmt.baht(grandTotals.zpm)}
            </td>
            <td className="tabular-nums px-3 py-2 text-body text-right font-bold font-mono align-middle">
              {fmt.baht(grandTotals.total)}
            </td>
          </tr>
        </tfoot>
      </Table>
    </div>
  )
}
