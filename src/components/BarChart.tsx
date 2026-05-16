'use client'

import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js'
import { useEffect, useRef } from 'react'
import { ALL_DEPTS, DeptName, DeptTotal } from '@/types/dashboard'

const C_BUD = '#378add'
const C_ZPM = '#1d9e75'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

function axisMoney(value: number | string | null) {
  const amount = Number(value) || 0
  if (Math.abs(amount) >= 1_000_000) return `฿${(amount / 1_000_000).toFixed(1)}M`
  if (Math.abs(amount) >= 1_000) return `฿${Math.round(amount / 1_000)}k`
  return `฿${Math.round(amount).toLocaleString('th-TH')}`
}

type Props = {
  deptTotals: Record<DeptName, DeptTotal>
}

export function BarChart({ deptTotals }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart<'bar'> | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return undefined
    const data = ALL_DEPTS.map((dept) => deptTotals[dept] || { bud: 0, zpm: 0 })

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: [...ALL_DEPTS],
        datasets: [
          {
            label: 'งบทำการ',
            data: data.map((item) => item.bud),
            backgroundColor: C_BUD,
            borderRadius: 4,
            barPercentage: 0.72,
            categoryPercentage: 0.62,
          },
          {
            label: 'ZPM',
            data: data.map((item) => item.zpm),
            backgroundColor: C_ZPM,
            borderRadius: 4,
            barPercentage: 0.72,
            categoryPercentage: 0.62,
          },
        ],
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111318',
            borderColor: 'rgba(255,255,255,0.14)',
            borderWidth: 1,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${axisMoney(context.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#b7bec8', font: { size: 11 } },
            border: { color: 'rgba(255,255,255,0.12)' },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: {
              color: '#88919c',
              callback: axisMoney,
              font: { size: 10 },
            },
            border: { display: false },
          },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    const data = ALL_DEPTS.map((dept) => deptTotals[dept] || { bud: 0, zpm: 0 })
    chart.data.datasets[0].data = data.map((item) => item.bud)
    chart.data.datasets[1].data = data.map((item) => item.zpm)
    chart.update('none')
  }, [deptTotals])

  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span>
          <i style={{ background: C_BUD }} />
          งบทำการ
        </span>
        <span>
          <i style={{ background: C_ZPM }} />
          ZPM
        </span>
      </div>
      <div className="canvas-box">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
