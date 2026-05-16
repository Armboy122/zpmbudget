# MEGA PROMPT — ZPM Budget Dashboard

วางทั้งก้อนนี้ใน Claude chat ใหม่ได้เลย

---

```
You are an expert full-stack developer. Build a complete ZPM Budget Dashboard web application from scratch. Output ALL files completely — no placeholders, no "// implement this", every function fully written.

---

## WHAT TO BUILD

A web dashboard for a Thai government electricity authority (PEA กฟภ.) that:
1. Accepts file uploads (SAP exports) via drag & drop
2. Parses and joins the files automatically
3. Shows an interactive budget comparison dashboard
4. Lets users filter which cost codes (สปก.) to include via checkboxes
5. Compares "งบทำการ" (operational budget) vs "ZPM" (maintenance orders) side by side

---

## FILE STRUCTURE TO CREATE

```
zpm-dashboard/
├── backend/
│   ├── main.py
│   ├── parser.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── hooks/
│       │   └── useDashboard.js
│       ├── pages/
│       │   ├── UploadPage.jsx
│       │   └── DashboardPage.jsx
│       ├── components/
│       │   ├── MetricCards.jsx
│       │   ├── BarChart.jsx
│       │   ├── SpkFilter.jsx
│       │   └── DeptTabs.jsx
│       └── styles/
│           └── main.css
└── docker-compose.yml
```

---

## INPUT FILE FORMATS (CRITICAL — READ CAREFULLY)

All files are exported from SAP as **UTF-16 little-endian encoded TSV** with `.xls` extension. They are NOT real Excel files — they must be decoded with `encoding='utf-16'` and parsed as tab-separated text.

### File Type 1: ZPM.xls — Cost Document Lines

Raw line examples (repr):
```
'\t\tสปก.ต้นทุน\tCElem.name\tMAT\tสร้าง\tเวลา\tPer\t  ปี\t    ปริมาณ\t   ValueCOCur\tPostg Date\tชื่อผู้ใช้\tชื่อออบเจค CO\tBusA\tใบสั่ง\tวัสดุ\tคำอธิบายวัสดุ\tRefDocNo\tRvrsl ref.\tRev\n'
'\t\t53051030\tค่าซ่อมแซม-ระบบไฟฟ้า\tZCN\t22.01.2026\t15:50:34\t  1\t2026\t        1\t   77,740.00\t22.01.2026\tS3SUBXX01\tจัดซื้อชุดเบรกเกอร์\tL112\t2001538433\t\t\t5004790402\n'
'\t\t53051030\tค่าซ่อมแซม-ระบบไฟฟ้า\tZCB\t08.01.2026\t16:38:10\t  1\t2026\t\t    3,510.00\t08.01.2026\tS3SUBXX01\tฟื้นฟูระบบไฟฟ้าในสถานีไฟฟ้าหาดใหญ่ 1\tL071\t2001558216\t\t\t2000017091\n'
'\t*\t\t\t\t\t\t\t\t        1\t   77,740.00\t\t\tจัดซื้อชุดเบรกเกอร์\t\t2001538433\n'   <- SKIP (subtotal)
```

Columns after splitting by '\t' (after pandas read_csv with sep='\t', skipping 2 leading empty cols):
- [0] สปก.ต้นทุน = cost element code (8 digits, e.g. "53051030")
- [1] CElem.name = cost element name (e.g. "ค่าซ่อมแซม-ระบบไฟฟ้า")
- [8] ValueCOCur = amount string with commas (e.g. "   77,740.00" or "-540.00")
- [13] ใบสั่ง = maintenance order number (e.g. "2001538433")

**Parse rules:**
- Header row: first line where line.count('\t') > 5
- Skip empty lines
- Skip subtotal lines: after splitting by '\t', parts[1].strip().startswith('*')
- Amount: strip whitespace, remove commas, convert to float (can be negative)
- Detect with: 'ValueCOCur' in text AND 'สปก.ต้นทุน' in text

### File Type 2: PM.xls — Maintenance Order Master

Raw line examples (repr):
```
'\tC\tปภ.\tใบสั่ง\tคำอธิบาย\tMAT\tศ.งานหลัก\tBusA\tUserStatus\tสถานะระบบ\tคำอธิบายของ FL\tเริ่มจริง\t ค่าจริงรวม\tพท.ทำการซ่อมบำรุง\tศูนย์งาน\n'
'\t\tZPM2\t2001532607\tจัดซื้อแบตเตอรี่ฯ\tZCN\tLSUBGS01\tL112\tCLSD\tCLSD CNF\txx โรงไฟฟ้าพลังลมสทิงพระ\t06.03.2026\t  1,216.35\tLWST\n'
'\t\tZPM2\t2001538433\tจัดซื้อชุดเบรกเกอร์\tZCN\tLSUBGS01\tL112\tCLSD\tCLSD CNF\txx โรงไฟฟ้าพลังลมสทิงพระ\t09.07.2025\t 83,507.94\tLWST\n'
```

Key columns: ใบสั่ง (order number), ศ.งานหลัก (work center = department code)
- Detect with: 'UserStatus' in text AND 'ค่าจริงรวม' in text

### File Type 3: L301034XXX.xls — Cost Center Budget Reports

Raw line examples (repr) from a real file:
```
'\t\tศูนย์ต้นทุน/กลุ่ม\t\tL301034000\t\t\t\tกบห.กสฟ.\n'          <- LINE 20: cc_code + cc_name
'\tส่วนประกอบต้นทุน\t\t\t  ต้นทุนจริง\t\t\t\t\t   ต/ทตามแผน\t\t\t\t  Var.(Abs.)\t\tผลต่าง (%)\n'  <- data section start
'\t   52010010  เงินเดือนพนักงาน\t\t\t  2,559,640.00\t\t\t\t\t  7,680,408.00\t\t\t\t-5,120,768.00\t\t-66.67\n'  <- actual present + plan present
'\t   52010030  OT พนักงาน\t\t\t\t\t\t\t\t    600,000.00\t\t\t\t-600,000.00\t\t-100.00\n'            <- actual ABSENT, plan present
'\t   52010050  เงินโบนัสพนักงาน\t\t\t  2,085,885.97\t\t\t\t\t\t\t\t\t  2,085,885.97\n'            <- actual present, plan ABSENT
'\t   53051010  วัสดุคลังซ่อมฯ/บำ\n'                                                                   <- both ABSENT (skip)
'\t*  เดบิต\t\t\t  5,900,328.05\t\t\t\t\t 11,589,030.66\t\t\t\t-5,688,702.61\t\t-49.09\n'         <- subtotal (skip)
'\t   89000100  วิศวกร -เวลาทำงาน\n'                                                                    <- STOP here (89xxxxxx = credit section)
```

**CRITICAL parsing insight — fixed column positions:**
Split each line by single '\t' (NOT splitting consecutive tabs). The columns are at FIXED tab positions:
- parts[1] = "   XXXXXXXX  name" (8-digit code + 2 spaces + name)
- parts[4] = actual amount ("ต้นทุนจริง") — THIS IS ALWAYS TAB INDEX 4
- When actual is 0, parts[4] is empty string

Proof from raw repr:
- Salary line: split gives parts[4] = '  2,559,640.00' ✓
- OT line (no actual): split gives parts[4] = '' (empty) → skip
- Bonus (actual, no plan): split gives parts[4] = '  2,085,885.97' ✓

**Parse rules:**
- Scan first 25 lines for cc_code: line matching regex r'ศูนย์ต้นทุน/กลุ่ม\t+(\S+)\t+(.*)'
- Find data section: line containing BOTH 'ส่วนประกอบต้นทุน' AND 'ต้นทุนจริง'
- For each data line: split by '\t', check parts[1] matches r'(\d{8})\s{2}(.+)', get actual from parts[4]
- STOP when line matches r'\t\s+89\d{6}' OR r'\t\*\s+เครดิต'
- Skip lines starting with '\t*' (subtotals)
- Detect with: 'ศูนย์ต้นทุน/กลุ่ม' in text AND 'ต้นทุนจริง' in text

---

## CONSTANTS

```python
DEPT_MAP = {
    'LSUBPC01': 'ผปค',
    'LSUBGS01': 'ผรผ',
    'LSUBSS01': 'ผสม',
    'LSUBEC01': 'ผอส',
}

BUDGET_DEPT_MAP = {
    'L301034000': 'ธุรการกอง', 'L301034001': 'ธุรการกอง',
    'L301034010': 'ผสม',       'L301034011': 'ผสม',
    'L301034020': 'ผรผ',       'L301034021': 'ผรผ',
    'L301034030': 'ผปค',       'L301034031': 'ผปค',
    'L301034040': 'ผอส',       'L301034041': 'ผอส',
}

WELFARE_SPKS = {
    '52010010','52010030','52010050','52010990','52011020',
    '52012010','52012040','52012060','52012070','52012990',
    '52020010','52020030','52020040','52020990','52021010','52021020',
}

ALL_DEPTS = ['ธุรการกอง', 'ผสม', 'ผอส', 'ผรผ', 'ผปค']
```

---

## VALIDATION CHECKSUMS (your output MUST match these)

After parsing the real files, these totals must be exactly correct:
- ZPM grand total: **2,390,354.94 บาท**
- Budget ธุรการกอง (L301034000 + L301034001): **5,900,328.05 บาท**
- Budget ผสม (L301034010 + L301034011): **3,474,971.53 บาท**
- Budget ผอส (L301034040 + L301034041): **4,183,486.62 บาท**
- Budget ผรผ (L301034020 + L301034021): **3,646,365.06 บาท**
- Budget ผปค (L301034030 + L301034031): **2,628,285.77 บาท**

---

## BACKEND: parser.py

Write complete `parser.py` with these functions:

### detect_file_type(content: bytes) -> str
Decode utf-16, check keywords, return 'ZPM' | 'PM' | 'BUDGET' | 'UNKNOWN'

### parse_zpm(content: bytes) -> list[dict]
Returns list of {'spk': str, 'elem_name': str, 'amount': float, 'order_no': str}
Use pandas: read_csv with sep='\t', dtype=str after decoding and filtering

### parse_pm(content: bytes) -> dict
Returns {order_no: work_center_code}

### parse_budget(content: bytes) -> tuple[str, str, list[dict]]
Returns (cc_code, cc_name, [{'spk': str, 'name': str, 'actual': float}])
Use fixed tab-index 4 for actual amount. Skip if empty.

### build_spk_data(zpm_rows, pm_map, bud_all) -> list[dict]
Returns list of SpkItem dicts:
{
  "s": "52022030",
  "n": "ค่าที่พัก-พนักงาน",
  "w": false,
  "d": {
    "ผสม": {"z": 520960.0, "b": 15250.0},
    "ผรผ": {"z": 36500.0, "b": 11500.0}
  },
  "tz": 626935.0,
  "tb": 125515.0
}
- Join ZPM with pm_map to get dept, map using DEPT_MAP
- Group ZPM by (spk, dept) summing amount
- Group budget by (spk, dept) summing actual
- Union all spk codes from both sources
- Mark welfare codes using WELFARE_SPKS
- Sort by (tz + tb) descending

---

## BACKEND: main.py

Complete FastAPI app:

```python
POST /api/upload
  - Accept List[UploadFile] named "files"
  - Auto-detect each file type
  - Parse all files
  - Call build_spk_data()
  - Return:
    {
      "spk_list": [...],
      "validation": {
        "zpm_rows": int,
        "pm_orders": int,
        "budget_files": int,
        "zpm_total": float,
        "dept_totals": {"ธุรการกอง": {"bud": float, "zpm": float}, ...}
      },
      "warnings": ["string", ...]
    }

GET /api/health -> {"status": "ok"}
```

CORS: allow http://localhost:5173 and http://localhost:3000

---

## BACKEND: requirements.txt

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
pandas==2.2.2
python-multipart==0.0.9
pydantic==2.7.1
```

---

## FRONTEND: Complete React App

### Color constants (use in all components)
```js
const C_BUD = '#378ADD'   // งบทำการ — blue
const C_ZPM = '#1D9E75'   // ZPM — green
```

### src/hooks/useDashboard.js

Central state hook using useState + useMemo (no Redux/Zustand needed):

```js
export function useDashboard() {
  // State: spkList, checked (Set), activeDept, loading, error, validation
  
  // useMemo: deptTotals, grandTotals, topBudDept, topZpmDept
  // deptTotals recalculates when spkList or checked changes
  
  // Functions: upload(files), toggleSpk(code), selectGroup(group)
  // selectGroup options: 'all' | 'none' | 'nowelfare' | 'zpmonly'
  
  return { spkList, checked, activeDept, setActiveDept,
           loading, error, validation,
           deptTotals, grandTotals, topBudDept, topZpmDept,
           upload, toggleSpk, selectGroup }
}
```

### src/pages/UploadPage.jsx

Centered upload page with:
- Drag & drop zone (dashed border, highlights on dragover)
- File list showing detected type per file
- Summary: "ZPM: X | PM: X | งบทำการ: X ไฟล์"
- "วิเคราะห์" button (disabled if no files, shows spinner when loading)
- Warning messages from API

### src/components/MetricCards.jsx

5 metric cards in CSS grid repeat(5,1fr):
1. งบรวม (เลือกแล้ว) — grandTotals.total
2. งบทำการ — grandTotals.bud + %
3. ZPM (color C_ZPM) — grandTotals.zpm + %
4. สูงสุด (งบทำการ) — topBudDept + amount
5. สูงสุด (ZPM) — topZpmDept + amount

Format: ≥1M → "X.XXM", ≥1000 → "Xk", else toLocaleString('th-TH')

### src/components/BarChart.jsx

Chart.js grouped bar chart:
- Import Chart.js via npm (already in package.json)
- useRef for canvas, useEffect to create and update chart
- Datasets: งบทำการ (C_BUD) + ZPM (C_ZPM)
- Y-axis ticks: format as ฿X.XM
- No default legend — render custom HTML legend above canvas
- Update efficiently: when deptTotals changes, update chart.data.datasets[n].data and call chart.update('none')

### src/components/SpkFilter.jsx

```
Props: { spkList, checked, toggleSpk, selectGroup }

Layout:
1. Row of 4 shortcut buttons:
   - เลือกทั้งหมด
   - ล้างทั้งหมด
   - ยกเว้นสวัสดิการพื้นฐาน
   - เฉพาะรหัสที่มี ZPM

2. Scrollable chip container (max-height: 160px, overflow-y: auto):
   One chip per SpkItem:
   - Checkbox (checked = checked.has(item.s))
   - SPK code in monospace font
   - Name
   - "Z" badge in green if item.tz > 0
   - "สวัสดิการ" label in muted if item.w === true
   
   Chip colors:
   - item.w === true: gray background, muted opacity
   - item.tz > 0: C_ZPM + '15' background (green tint)
   - else: C_BUD + '12' background (blue tint)
```

### src/components/DeptTabs.jsx

```
Props: { spkList, checked, activeDept, setActiveDept, deptTotals, grandTotals }

Tab buttons: ภาพรวม | ธุรการกอง | ผสม | ผอส | ผรผ | ผปค

OVERVIEW TABLE (activeDept === 'all'):
Columns: แผนก | สัดส่วน | งบทำการ | ZPM | รวม

For each dept row:
- สัดส่วน: stacked progress bar (blue for bud%, green for zpm%) on gray bg
  + text "X% ของทั้งหมด · งบทำการ Y% ZPM Z%"
- Format all amounts with ฿ and toLocaleString

DEPT DETAIL TABLE (activeDept !== 'all'):
Columns: รหัส สปก. | ชื่อบัญชี | งบทำการ | ZPM | %

Filter: spkList where checked.has(item.s) AND item.d[activeDept] exists
Sort: by (bud + zpm for that dept) descending
Show "สวัสดิการ" gray label if item.w === true

FOOTER BAR:
- Left: active filter description + row count
- Right: total amount for current view (bold)
```

### src/pages/DashboardPage.jsx

Compose all components:
```jsx
<MetricCards ... />
<BarChart ... />
<SpkFilter ... />
<DeptTabs ... />
```

Add "อัปโหลดใหม่" button top-right to reset (clear spkList)
Show validation summary (collapsible): ZPM rows, PM orders, budget files, totals

### src/App.jsx

```jsx
function App() {
  const dashboard = useDashboard()
  if (dashboard.spkList.length === 0)
    return <UploadPage onUpload={dashboard.upload} loading={dashboard.loading} />
  return <DashboardPage {...dashboard} onReset={() => dashboard.reset()} />
}
```

Add reset() function to useDashboard that clears spkList and checked.

### src/styles/main.css

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
       background: #0f0f0f; color: #e8e8e8; }

/* CSS Variables */
:root {
  --c-bud: #378ADD;
  --c-zpm: #1D9E75;
  --c-bg-primary: #1a1a1a;
  --c-bg-secondary: #242424;
  --c-bg-tertiary: #2e2e2e;
  --c-border: rgba(255,255,255,0.1);
  --c-text-primary: #e8e8e8;
  --c-text-secondary: #999;
  --c-text-tertiary: #666;
  --radius-md: 8px;
  --radius-lg: 12px;
}

/* Cards */
.metric-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.metric-card { background: var(--c-bg-secondary); border-radius: var(--radius-md); padding: 12px 14px; }
.metric-card .label { font-size: 11px; color: var(--c-text-secondary); margin-bottom: 4px; }
.metric-card .value { font-size: 18px; font-weight: 500; }
.metric-card .sub { font-size: 10px; color: var(--c-text-tertiary); margin-top: 2px; }

/* Tabs */
.tab-btn { cursor: pointer; padding: 7px 16px; border-radius: var(--radius-md);
           border: 0.5px solid var(--c-border); font-size: 13px; font-weight: 500;
           color: var(--c-text-secondary); background: transparent; transition: all .15s; }
.tab-btn.active { background: rgba(55,138,221,0.15); color: var(--c-bud); border-color: var(--c-bud); }

/* Table rows */
.trow { display: grid; gap: 6px; align-items: center; padding: 8px 0;
        border-bottom: 0.5px solid var(--c-border); font-size: 12px; }
.thead { font-size: 10px; font-weight: 500; color: var(--c-text-tertiary);
         border-bottom: 1px solid rgba(255,255,255,0.15); }

/* SPK Chips */
.chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px;
        border-radius: 20px; border: 0.5px solid var(--c-border);
        font-size: 11px; cursor: pointer; user-select: none; }
.chip input { accent-color: var(--c-bud); }

/* Upload zone */
.drop-zone { border: 2px dashed var(--c-border); border-radius: var(--radius-lg);
             padding: 48px; text-align: center; cursor: pointer; transition: all .2s; }
.drop-zone.drag-over { border-color: var(--c-bud); background: rgba(55,138,221,0.05); }

/* Table container */
.table-container { background: var(--c-bg-primary); border: 0.5px solid var(--c-border);
                   border-radius: var(--radius-lg); padding: 4px 14px 8px; }

/* Buttons */
.btn { padding: 7px 16px; border-radius: var(--radius-md); border: 0.5px solid var(--c-border);
       font-size: 13px; cursor: pointer; background: transparent; color: var(--c-text-secondary);
       transition: all .15s; }
.btn:hover { background: var(--c-bg-tertiary); }
.btn-primary { background: var(--c-bud); color: white; border-color: transparent; }
.btn-primary:hover { opacity: .9; }
.btn-primary:disabled { opacity: .4; cursor: not-allowed; }
```

---

## CONFIG FILES

### frontend/package.json
```json
{
  "name": "zpm-dashboard",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "chart.js": "^4.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.1"
  }
}
```

### frontend/vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8000' } }
})
```

### frontend/index.html
```html
<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ZPM Budget Dashboard — กสฟ.</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### frontend/src/main.jsx
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/main.css'
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

### backend/Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./backend:/app"]
  frontend:
    image: node:20-alpine
    working_dir: /app
    ports: ["5173:5173"]
    volumes: ["./frontend:/app"]
    command: sh -c "npm install && npm run dev -- --host"
```

---

## IMPORTANT NOTES

1. **No TypeScript** — use plain JavaScript (.jsx, .js)
2. **No Tailwind** — use the CSS classes defined in main.css and inline styles
3. **No Redux** — useState + useMemo in useDashboard.js is sufficient
4. **Dark theme** — the CSS above defines a dark theme, use those variables
5. **All amounts** must be rounded before display: use Math.round() or toFixed(2)
6. **Negative amounts** in budget data are valid (e.g. -11,500 for credit entries) — keep them
7. **The parser is the most critical part** — wrong tab-index = wrong numbers. Budget actual is ALWAYS at tab-index 4 (split by single '\t')
8. When frontend calls POST /api/upload, use FormData and append each file as 'files'

Now output ALL files completely, one by one, starting with parser.py.
```
