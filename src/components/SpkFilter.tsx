import { SpkItem } from '@/types/dashboard'

function chipStyle(item: SpkItem) {
  if (item.w) return { background: 'rgba(255,255,255,0.045)', opacity: 0.76 }
  if ((Number(item.tz) || 0) > 0) return { background: '#1d9e7518', borderColor: '#1d9e7555' }
  return { background: '#378add14', borderColor: '#378add44' }
}

type Props = {
  checked: Set<string>
  selectGroup: (group: 'all' | 'none' | 'nowelfare' | 'zpmonly') => void
  spkList: SpkItem[]
  toggleSpk: (code: string) => void
}

export function SpkFilter({ checked, selectGroup, spkList, toggleSpk }: Props) {
  return (
    <section className="panel filter-panel">
      <div className="panel-head">
        <div>
          <p className="section-kicker">SPK Filter</p>
          <h2>เลือก สปก.</h2>
        </div>
        <span className="selected-count">{checked.size} เลือก</span>
      </div>

      <div className="filter-actions">
        <button className="btn mini" onClick={() => selectGroup('all')} type="button">
          เลือกทั้งหมด
        </button>
        <button className="btn mini" onClick={() => selectGroup('none')} type="button">
          ล้างทั้งหมด
        </button>
        <button className="btn mini" onClick={() => selectGroup('nowelfare')} type="button">
          ยกเว้นสวัสดิการพื้นฐาน
        </button>
        <button className="btn mini" onClick={() => selectGroup('zpmonly')} type="button">
          เฉพาะรหัสที่มี ZPM
        </button>
      </div>

      <div className="chip-container">
        {spkList.map((item) => (
          <label className="chip" key={item.s} style={chipStyle(item)} title={item.n}>
            <input checked={checked.has(item.s)} onChange={() => toggleSpk(item.s)} type="checkbox" />
            <code>{item.s}</code>
            <span className="chip-name">{item.n}</span>
            {(Number(item.tz) || 0) > 0 && <b className="badge zpm">Z</b>}
            {item.w && <span className="welfare-label">สวัสดิการ</span>}
          </label>
        ))}
      </div>
    </section>
  )
}
