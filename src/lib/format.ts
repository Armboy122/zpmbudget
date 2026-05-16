export const fmt = {
  baht: (n: number) =>
    `฿${Math.round(Number(n) || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`,

  bahtCompact: (n: number) => {
    const amount = Math.round(Number(n) || 0)
    const abs = Math.abs(amount)
    if (abs >= 1_000_000) return `฿${(amount / 1_000_000).toFixed(2)}M`
    if (abs >= 1_000) return `฿${(amount / 1_000).toFixed(1)}K`
    return `฿${amount.toLocaleString('th-TH')}`
  },

  pct: (n: number, decimals = 0) =>
    `${(Number(n) || 0).toFixed(decimals)}%`,

  pctInt: (n: number) => `${Math.round(Number(n) || 0)}%`,

  date: (d: Date | string | undefined | null) => {
    if (!d) return 'ไม่ระบุ'
    const date = typeof d === 'string' ? new Date(d) : d
    if (Number.isNaN(date.getTime())) return String(d)
    return date.toLocaleString('th-TH', {
      calendar: 'buddhist',
      dateStyle: 'long',
      timeStyle: 'short',
    })
  },

  dateShort: (d: Date | string | undefined | null) => {
    if (!d) return 'ไม่ระบุ'
    const date = typeof d === 'string' ? new Date(d) : d
    if (Number.isNaN(date.getTime())) return String(d)
    return date.toLocaleString('th-TH', {
      calendar: 'buddhist',
      dateStyle: 'medium',
    })
  },
}
