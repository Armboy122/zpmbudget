import { fmt } from '@/lib/format'
import type { GrandTotals } from '@/types/dashboard'

type Props = {
  grandTotals: GrandTotals
  spkCount: number
  deptCount: number
}

export function HeroMetric({ grandTotals, spkCount, deptCount }: Props) {
  return (
    <article
      className={[
        'col-span-2',
        'bg-gradient-to-br from-accent-bud-soft to-surface-card',
        'border border-border-subtle border-l-4 border-l-accent-bud-strong',
        'rounded-xl',
        'shadow-card',
        'p-6',
      ].join(' ')}
    >
      <p className="text-kicker mb-2">งบรวมที่เลือก</p>

      <p className="text-display tabular text-fg-primary mb-3">
        {fmt.baht(grandTotals.total)}
      </p>

      <div className="border-t border-border-subtle pt-3 grid grid-cols-2 gap-2">
        <div>
          <span className="text-small text-fg-tertiary">งบทำการ</span>
          <p className="tabular text-body font-semibold text-accent-bud">
            {fmt.bahtCompact(grandTotals.bud)}
          </p>
        </div>
        <div>
          <span className="text-small text-fg-tertiary">ZPM</span>
          <p className="tabular text-body font-semibold text-accent-zpm">
            {fmt.bahtCompact(grandTotals.zpm)}
          </p>
        </div>
      </div>

      <p className="text-caption text-fg-tertiary mt-3">
        {deptCount} แผนก · {spkCount} สปก. ที่เลือก
      </p>
    </article>
  )
}
