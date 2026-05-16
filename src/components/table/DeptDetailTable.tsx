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
import type { DeptName, SpkItem } from '@/types/dashboard'

type SortKey = 'code' | 'name' | 'bud' | 'zpm' | 'zpmPct'
type SortDir = 'asc' | 'desc'

type Props = {
  activeDept: DeptName
  checked: Set<string>
  spkList: SpkItem[]
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="opacity-30 ml-1">↕</span>
  return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

export function DeptDetailTable({ activeDept, checked, spkList }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('zpm')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const rows = spkList
    .filter((item) => checked.has(item.s) && item.d?.[activeDept])
    .map((item) => {
      const d = item.d?.[activeDept]
      const bud = Number(d?.b ?? d?.bud) || 0
      const zpm = Number(d?.z ?? d?.zpm) || 0
      const total = bud + zpm
      const zpmPct = total ? (zpm / total) * 100 : 0
      return { item, bud, zpm, total, zpmPct }
    })
    .sort((a, b) => {
      const va = sortKey === 'code' ? a.item.s : sortKey === 'name' ? a.item.n : sortKey === 'bud' ? a.bud : sortKey === 'zpm' ? a.zpm : a.zpmPct
      const vb = sortKey === 'code' ? b.item.s : sortKey === 'name' ? b.item.n : sortKey === 'bud' ? b.bud : sortKey === 'zpm' ? b.zpm : b.zpmPct
      const cmp = typeof va === 'string' ? va.localeCompare(vb as string, 'th') : (va as number) - (vb as number)
      return sortDir === 'asc' ? cmp : -cmp
    })

  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-fg-tertiary">
        <div className="text-[32px] mb-3">📋</div>
        <p className="font-medium mb-2">ไม่มีรายการในตัวกรองนี้</p>
        <p className="text-small">ลองเลือก สปก. อย่างน้อย 1 รายการ</p>
      </div>
    )
  }

  const totalBud = rows.reduce((s, r) => s + r.bud, 0)
  const totalZpm = rows.reduce((s, r) => s + r.zpm, 0)

  return (
    <div className="overflow-x-auto">
      <Table>
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '38%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '18%' }} />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableHeaderCell
              onClick={() => handleSort('code')}
              className="sticky top-0 z-10 bg-surface-sunken text-caption font-semibold text-fg-secondary border-b-2 border-border-default whitespace-nowrap cursor-pointer select-none text-left"
            >
              รหัส <SortIcon active={sortKey === 'code'} dir={sortDir} />
            </TableHeaderCell>
            <TableHeaderCell
              onClick={() => handleSort('name')}
              className="sticky top-0 z-10 bg-surface-sunken text-caption font-semibold text-fg-secondary border-b-2 border-border-default whitespace-nowrap cursor-pointer select-none text-left"
            >
              ชื่อบัญชี <SortIcon active={sortKey === 'name'} dir={sortDir} />
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
              onClick={() => handleSort('zpmPct')}
              className="sticky top-0 z-10 bg-surface-sunken text-caption font-semibold text-fg-secondary border-b-2 border-border-default whitespace-nowrap cursor-pointer select-none text-right"
            >
              %ZPM <SortIcon active={sortKey === 'zpmPct'} dir={sortDir} />
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(({ item, bud, zpm, zpmPct }, i) => (
            <TableRow
              key={item.s}
              className={[
                i % 2 === 0 ? 'bg-surface-card' : 'bg-surface-sunken',
                'hover:outline hover:outline-2 hover:outline-border-strong hover:-outline-offset-2',
              ].join(' ')}
            >
              <TableCell className="text-body align-middle">
                <code className="font-mono text-mono bg-surface-sunken border border-border-subtle rounded-sm px-1.5 py-[1px] text-fg-secondary">
                  {item.s}
                </code>
              </TableCell>
              <TableCell className="text-body align-middle max-w-0">
                <span
                  className="block overflow-hidden text-ellipsis whitespace-nowrap"
                  title={item.n}
                >
                  {item.n}
                </span>
                {item.w && (
                  <Badge className="text-kicker font-semibold not-italic text-status-warning bg-status-warning-bg rounded-pill px-[5px] py-[1px]">
                    สวัสดิการ
                  </Badge>
                )}
              </TableCell>
              <TableCell className="tabular-nums text-body text-right font-mono text-accent-bud-strong align-middle">
                {bud > 0 ? fmt.baht(bud) : <span className="text-fg-disabled">—</span>}
              </TableCell>
              <TableCell className="tabular-nums text-body text-right font-mono text-accent-zpm-strong align-middle">
                {zpm > 0 ? fmt.baht(zpm) : <span className="text-fg-disabled">—</span>}
              </TableCell>
              <TableCell className="text-body text-right align-middle">
                <div className="flex flex-col items-end gap-[3px]">
                  <span className={[
                    'tabular-nums font-medium',
                    zpmPct > 30 ? 'text-status-warning' : 'text-fg-primary',
                  ].join(' ')}>
                    {fmt.pctInt(zpmPct)}
                  </span>
                  <div className="w-10 h-1 rounded-pill bg-surface-sunken overflow-hidden">
                    <div
                      className={zpmPct > 30 ? 'bg-status-warning h-full' : 'bg-accent-zpm h-full'}
                      style={{ width: `${Math.min(zpmPct, 100)}%` }}
                    />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <tfoot>
          <tr className="bg-accent-bud-soft border-t-2 border-accent-bud">
            <td
              colSpan={2}
              className="px-3 py-2 text-body font-bold align-middle"
            >
              รวม {rows.length} รายการ
            </td>
            <td className="tabular-nums px-3 py-2 text-body text-right font-bold font-mono text-accent-bud-strong align-middle">
              {fmt.baht(totalBud)}
            </td>
            <td className="tabular-nums px-3 py-2 text-body text-right font-bold font-mono text-accent-zpm-strong align-middle">
              {fmt.baht(totalZpm)}
            </td>
            <td className="tabular-nums px-3 py-2 text-body text-right font-bold font-mono align-middle">
              {fmt.baht(totalBud + totalZpm)}
            </td>
          </tr>
        </tfoot>
      </Table>
    </div>
  )
}
