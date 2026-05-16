# ZPM Budget Dashboard — Design Specification

> เอกสารออกแบบสำหรับ Dashboard งบประมาณ ZPM ของ การไฟฟ้าส่วนภูมิภาค (กฟภ./กสฟ.)
> ปรับให้เป็นภาพลักษณ์ราชการที่ทันสมัย อ่านง่าย น่าเชื่อถือ และเหมาะกับการใช้งานในที่ทำงานจริง

---

## 1. หลักการออกแบบ (Design Principles)

| หลักการ | ความหมาย |
|---|---|
| **ทางการแต่ไม่แข็ง** | บุคลิกแบบเอกสารราชการรุ่นใหม่ — สะอาด มีระเบียบ แต่ไม่ตึง |
| **ตัวเลขนำ ตัวอักษรตาม** | งบประมาณคือพระเอก ต้องเด่นที่สุดเสมอ (visual hierarchy เริ่มที่ตัวเลข) |
| **อ่านได้จากระยะ 2 เมตร** | Dashboard ต้องอ่านได้จากจอประชุม ไม่ใช่แค่หน้าจอตัวเอง |
| **ไทยก่อน ฝรั่งทีหลัง** | ภาษาไทยเป็นหลัก ฟอนต์อังกฤษต้องเข้ากับฟอนต์ไทย ไม่ใช่กลับกัน |
| **ลำดับชั้นด้วยขนาด ไม่ใช่สี** | สีใช้เพื่อหมายความ (semantic) ขนาด/น้ำหนักใช้เพื่อจัดลำดับ |
| **ลด chrome ขยาย data** | ขอบ/เงา/พื้น decorative ต้องน้อย → ข้อมูลต้องได้พื้นที่ |

### ปัญหา UI ปัจจุบันที่ต้องแก้

1. **Dark theme ทึบเกินไป** — ไม่เหมาะกับเอกสารราชการ ทำให้ดูเหมือนเว็บ crypto/gaming
2. **ฟอนต์ระบบ (Aptos, Segoe UI, Tahoma)** — ไม่สม่ำเสมอข้ามเครื่อง ตัวอักษรไทยจะ render ออกมาเป็น Tahoma ซึ่งดูเก่า ไม่ทางการ
3. **Metric Cards 5 ใบเท่ากันหมด** — ขาด hierarchy ผู้ใช้ไม่รู้ว่าตัวไหนสำคัญสุด
4. **สี blue (#378add) + green (#1d9e75)** — เป็นสี default ไม่สะท้อนแบรนด์ PEA และความ contrast บน dark bg ไม่พอสำหรับ a11y AA สำหรับตัวเลข
5. **ตารางอ่านยาก** — font-size 12px, ไม่มี zebra striping, alignment ตัวเลขไม่ tabular
6. **Chip filter ดูเหมือน tag random** — ขาดโครงสร้างทำให้กรอง 68 รายการแล้วเหนื่อยตา
7. **Bar chart ลอย** — ไม่มี grid baseline ไม่มี value label อ่านค่าจริงไม่ได้
8. **Admin Upload เป็น dock ลอยมุมขวาล่าง** — ขัดจังหวะ flow ปกติ
9. **ไม่มี print style** — เอกสารราชการต้องพรินต์ได้

---

## 2. Typography — ฟอนต์ไทยทางการ

### 2.1 Font Stack

ใช้ **IBM Plex Sans Thai Looped** เป็นหลัก (modern, formal, ออกแบบเฉพาะสำหรับงาน UI/data) คู่กับ **IBM Plex Sans** สำหรับอักษรอังกฤษ และ **IBM Plex Mono** สำหรับ code/รหัส สปก. — ครอบครัวเดียวกัน ไหลเข้ากันสนิท

ทางเลือกสำรอง: **Sarabun** (ฟอนต์ราชการ 13 ฟอนต์ตามมติ ครม. ปี 2553) สำหรับโทนทางการดั้งเดิมยิ่งขึ้น

```css
:root {
  /* Primary — UI, body, ตัวเลข */
  --font-sans:
    "IBM Plex Sans Thai Looped",
    "IBM Plex Sans",
    "Sarabun",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  /* Display — หัวเรื่องใหญ่ เลขเด่น */
  --font-display:
    "IBM Plex Sans Thai Looped",
    "IBM Plex Sans",
    "Sarabun",
    sans-serif;

  /* Mono — รหัส สปก., GL account */
  --font-mono:
    "IBM Plex Mono",
    "JetBrains Mono",
    "SFMono-Regular",
    Consolas,
    monospace;

  /* Numerals — บังคับ tabular figures สำหรับงบประมาณ */
  font-feature-settings: "tnum" 1, "ss01" 1;
}
```

### 2.2 Loading

```html
<!-- ใน <head> ของ app/layout.tsx -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style"
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
```

หรือใช้ `next/font/google` ซึ่งทำ self-host + subset ให้อัตโนมัติ (preferred):

```ts
// src/app/layout.tsx
import { IBM_Plex_Sans_Thai_Looped, IBM_Plex_Mono } from 'next/font/google'

const sans = IBM_Plex_Sans_Thai_Looped({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})
```

### 2.3 Type Scale

ขนาดตัวอักษรใช้ระบบ modular scale 1.20 (minor third) เพื่อให้ลำดับชั้นชัดแต่ไม่กระโดด ตัวเลขทุกระดับใช้ `font-variant-numeric: tabular-nums`

| Token | px / line-height | weight | การใช้งาน |
|---|---|---|---|
| `--text-display` | 36 / 1.15 | 700 | งบรวมในการ์ดเด่น (1 จุดต่อหน้า) |
| `--text-h1` | 28 / 1.25 | 650 | ชื่อ Dashboard |
| `--text-h2` | 20 / 1.35 | 600 | หัวข้อ panel (เช่น "งบทำการ vs ZPM") |
| `--text-h3` | 16 / 1.4 | 600 | ชื่อแผนก ในตาราง |
| `--text-metric` | 24 / 1.2 | 700 | ตัวเลขใน metric card รอง |
| `--text-body` | 14 / 1.55 | 400 | ข้อความทั่วไป cell ในตาราง |
| `--text-body-strong` | 14 / 1.55 | 600 | ค่ารวมในแถว footer |
| `--text-small` | 13 / 1.5 | 400 | คำอธิบายใต้ค่า, hint |
| `--text-mono` | 13 / 1.4 | 500 | รหัส สปก., GL |
| `--text-kicker` | 11 / 1.4 | 600 | section eyebrow, ตัวพิมพ์ใหญ่ letter-spacing 0.08em |
| `--text-caption` | 12 / 1.45 | 400 | metadata, timestamp |

ตัวอย่าง CSS variables:

```css
:root {
  --text-display: 36px;
  --text-h1: 28px;
  --text-h2: 20px;
  --text-h3: 16px;
  --text-metric: 24px;
  --text-body: 14px;
  --text-small: 13px;
  --text-mono: 13px;
  --text-kicker: 11px;
  --text-caption: 12px;
}
```

### 2.4 กฎภาษาไทย

- **ไม่ใช้ตัวเอียง (italic) กับอักษรไทย** — ไทยไม่มี italic ตามธรรมเนียม ใช้ weight หรือสีแทน
- **ห้าม letter-spacing < 0 กับไทย** — ทำให้สระ/วรรณยุกต์ทับกัน
- **ระยะบรรทัด ≥ 1.45** สำหรับเนื้อหา ไม่งั้นตัวอักษรลอยสูง (สระบน/วรรณยุกต์) ติดบรรทัดบน
- **ตัวเลขใช้ font-feature-settings: "tnum"** ทุกที่ที่เป็น table หรือ metric

---

## 3. Color System

### 3.1 บุคลิกสี

เปลี่ยนจาก **dark theme ทึบ** → **light theme แบบเอกสารราชการ** เป็น default และเก็บ dark theme เป็น option

- พื้นหลัง: ขาวอุ่น (ไม่ใช่ขาวจัด — ลดแสงสะท้อน)
- ตัวอักษร: เทาดำ (oklch 22% — กับ AAA สำหรับ body)
- Accent หลัก: **น้ำเงิน PEA-aligned** (ใกล้สีองค์กร แต่ปรับ contrast ให้พอ)
- Accent รอง: **เขียวมรกต** สำหรับ ZPM
- ส้มเตือน, แดง error, เหลือง warning

### 3.2 Tokens

```css
:root {
  /* Surface */
  --surface-page:        oklch(98.5% 0.003 250); /* ขาวอุ่นเล็กน้อย */
  --surface-card:        #ffffff;
  --surface-sunken:      oklch(96.5% 0.005 250); /* สำหรับ table head, code */
  --surface-overlay:     oklch(99% 0 0);

  /* Borders */
  --border-subtle:       oklch(92% 0.005 250);
  --border-default:      oklch(87% 0.008 250);
  --border-strong:       oklch(75% 0.01 250);

  /* Text */
  --text-primary:        oklch(22% 0.01 250);   /* #2a2f36 */
  --text-secondary:      oklch(42% 0.012 250);  /* รอง */
  --text-tertiary:       oklch(58% 0.012 250);  /* hint, caption */
  --text-disabled:       oklch(72% 0.008 250);
  --text-on-accent:      #ffffff;

  /* Brand / Categorical */
  --accent-bud:          oklch(48% 0.16 255);   /* น้ำเงิน — งบทำการ */
  --accent-bud-soft:     oklch(94% 0.04 255);
  --accent-bud-strong:   oklch(38% 0.18 255);

  --accent-zpm:          oklch(52% 0.14 165);   /* เขียวมรกต — ZPM */
  --accent-zpm-soft:     oklch(94% 0.04 165);
  --accent-zpm-strong:   oklch(40% 0.16 165);

  /* Semantic */
  --color-success:       oklch(55% 0.15 150);
  --color-warning:       oklch(70% 0.16 75);
  --color-danger:        oklch(58% 0.20 25);
  --color-info:          oklch(58% 0.14 230);

  /* Soft backgrounds (สำหรับ chip, badge, alert) */
  --color-success-bg:    oklch(96% 0.04 150);
  --color-warning-bg:    oklch(96% 0.05 75);
  --color-danger-bg:     oklch(96% 0.04 25);
  --color-info-bg:       oklch(96% 0.04 230);

  /* Focus ring (WCAG 2.2 compliant) */
  --ring:                oklch(55% 0.2 255 / 0.5);
}

/* Dark theme override (เผื่อใช้กลางคืน) */
[data-theme="dark"] {
  --surface-page:        oklch(16% 0.01 250);
  --surface-card:        oklch(20% 0.012 250);
  --surface-sunken:      oklch(13% 0.01 250);
  --text-primary:        oklch(94% 0.005 250);
  --text-secondary:      oklch(72% 0.008 250);
  --text-tertiary:       oklch(58% 0.01 250);
  --border-subtle:       oklch(28% 0.012 250);
  --border-default:      oklch(34% 0.012 250);
  --accent-bud:          oklch(68% 0.16 255);
  --accent-zpm:          oklch(70% 0.14 165);
}
```

### 3.3 ความหมายของสี (Semantic Usage)

- **น้ำเงิน (`--accent-bud`)** = "งบทำการ" เท่านั้น — ห้ามใช้เป็นสี neutral หรือ link
- **เขียว (`--accent-zpm`)** = "ZPM" เท่านั้น — ไม่ใช่ "สำเร็จ" (success ใช้ `--color-success` แยก)
- **ส้ม/เหลือง** = warning หรือสถานะ "ไม่ครบ" (เช่น Admin Upload เหลือไฟล์)
- **แดง** = error, ลบ, เกินงบ
- **เทา neutral** = ข้อมูล metadata, สวัสดิการพื้นฐาน (ไม่มี ZPM)

### 3.4 Contrast Checks (WCAG 2.2)

ทุกคู่ต้องผ่าน:
- Body text บน surface: ≥ 7:1 (AAA)
- Large text (≥ 24px) บน surface: ≥ 4.5:1 (AAA)
- ตัวเลขใน metric card: ≥ 7:1
- Chart series labels: ≥ 4.5:1
- Focus ring: ≥ 3:1 กับสีรอบ

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px base)

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
}
```

### 4.2 Radius

```css
:root {
  --radius-sm: 6px;     /* chip, badge */
  --radius-md: 10px;    /* button, input, small card */
  --radius-lg: 14px;    /* panel, card */
  --radius-xl: 20px;    /* hero card (งบรวม) */
  --radius-pill: 999px;
}
```

### 4.3 Elevation (เงา)

ในธีมราชการเงาต้อง **เบาและสะอาด** ไม่ใช่ drop shadow แรงๆ

```css
:root {
  --shadow-sm:  0 1px 2px oklch(20% 0.01 250 / 0.06);
  --shadow-md:  0 2px 8px oklch(20% 0.01 250 / 0.06),
                0 1px 2px oklch(20% 0.01 250 / 0.04);
  --shadow-lg:  0 8px 24px oklch(20% 0.01 250 / 0.08),
                0 2px 6px oklch(20% 0.01 250 / 0.05);
  --shadow-focus: 0 0 0 3px var(--ring);
}
```

### 4.4 Container

```css
.app-shell {
  width: min(1440px, calc(100vw - var(--space-6)));
  margin: 0 auto;
  padding-block: var(--space-5) var(--space-7);
}
```

---

## 5. Layout — โครงสร้างหน้า

### 5.1 Grid โดยรวม (1440px desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER  (กฟภ. crest · ชื่อหน่วยงาน · timestamp · admin trigger)        │  72px
├──────────────────────────────────────────────────────────────────────┤
│  SNAPSHOT BAR  (เลือก snapshot · โหลดล่าสุด · จำนวนรายการใน DB)         │  56px
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  HERO METRIC  +  SUPPORTING METRICS                                   │
│  ┌──────────────────────┐ ┌─────────┐┌─────────┐┌─────────┐          │
│  │  งบรวม (เลือกแล้ว)    │ │ งบทำการ ││  ZPM    ││ Top BUD │          │
│  │                       │ │         ││         ││ Top ZPM │          │
│  │   ฿24,820,194         │ │ ฿18.4M  ││ ฿6.4M   ││         │          │
│  │   12 แผนก · 68 สปก.   │ │ 74%     ││ 26%     ││         │          │
│  └──────────────────────┘ └─────────┘└─────────┘└─────────┘          │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│  CHART (60%)                              │  SPK FILTER (40%)        │
│  ┌────────────────────────────────────┐  │  ┌──────────────────┐    │
│  │ งบทำการ vs ZPM ตามแผนก              │  │ เลือก สปก.        │    │
│  │  ▮▮▮▮ ▯▯  กฟจ.A                   │  │ [ทั้งหมด] [ZPM]  │    │
│  │  ▮▮▮ ▯▯▯ กฟจ.B                   │  │ ┌─chip─┐┌─chip─┐  │    │
│  │  ▮▮ ▯▯▯▯ กฟจ.C                   │  │ ...               │    │
│  └────────────────────────────────────┘  │  └──────────────────┘    │
├──────────────────────────────────────────────────────────────────────┤
│  DEPT TAB STRIP                                                      │
│  [ ภาพรวม ][ กฟจ.A ][ กฟจ.B ] ...                                    │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ตารางตามแผนก (overview หรือ detail)                              ││
│  └─────────────────────────────────────────────────────────────────┘│
│  footer: รวม ฿xxx · แสดง n แถว                                       │
├──────────────────────────────────────────────────────────────────────┤
│  ▸ Validation summary (collapsible)                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 Responsive Breakpoints

| Breakpoint | Width | การปรับ |
|---|---|---|
| `xl` | ≥ 1280px | 5 metric cards row, dashboard-grid 1.4fr + 0.8fr |
| `lg` | ≥ 1024px | 4 metric cards row + 1 row, dashboard-grid 1fr + 1fr |
| `md` | ≥ 720px | metric grid 2×2 + hero ใหญ่เต็มแถว, chart/filter stack |
| `sm` | < 720px | ทุกอย่าง stack แนวตั้ง, admin upload เปิดเป็น sheet เต็มจอ |

---

## 6. Components Specification

### 6.1 Page Header

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──┐                                                             │
│  │PEA│  การไฟฟ้าส่วนภูมิภาค · กสฟ.                          [Admin] │
│  └──┘  ZPM Budget Dashboard                                       │
│        ปรับปรุงข้อมูลล่าสุด · 16 พ.ค. 2569 14:32 น.                │
└──────────────────────────────────────────────────────────────────┘
```

- โลโก้ PEA 36×36px (มี หรือ placeholder ตัวอักษรในกล่องสีน้ำเงิน)
- Eyebrow บรรทัดแรก: `text-kicker` สีรอง
- Title: `text-h1`, weight 650
- Timestamp: `text-caption` สี tertiary, **ใช้รูปแบบไทย พ.ศ.** (`th-TH` locale + `calendar: 'buddhist'`)
- ปุ่ม Admin: secondary button มุมขวาบน (ไม่ใช่ primary — เพราะไม่ใช่ action หลักของหน้า)

### 6.2 Snapshot Picker

ปรับจาก strip 3 column เป็น toolbar รูปแบบ filter bar ที่นิ่งกว่า:

```
┌──────────────────────────────────────────────────────────────────┐
│  📅 ข้อมูล ณ:  [▾ 16 พ.ค. 2569 14:32 · upload #248        ]  ↻  │
│              68 รายการ · 12 แผนก · พบ snapshot 12 ชุดใน DB        │
└──────────────────────────────────────────────────────────────────┘
```

- พื้น `--surface-sunken`, border-bottom เท่านั้น (ไม่มีกรอบรอบ)
- Select มี calendar icon
- ปุ่ม reload เป็น icon-only มีอ่าน label จาก `aria-label`
- มี keyboard shortcut: `R` = reload, `S` = focus snapshot

### 6.3 Metric Cards (ปรับ hierarchy)

เปลี่ยนจาก 5 ใบเท่ากันหมด → **1 hero + 4 supporting** เพื่อให้ "งบรวม" เด่นชัด

#### Hero Card (งบรวม)

```
┌──────────────────────────────┐
│ งบรวมที่เลือก                  │  ← text-kicker
│                              │
│ ฿24,820,194                  │  ← text-display (36px, bold)
│                              │
│ งบทำการ ฿18,420,000          │  ← text-small, 2 บรรทัด split
│ ZPM     ฿ 6,400,194          │
│ ───────────────────          │
│ 12 แผนก · 68 สปก.            │
└──────────────────────────────┘
```

- พื้น: gradient อ่อนๆ จาก `--accent-bud-soft` → `--surface-card`
- ขอบซ้าย 4px สี `--accent-bud-strong`
- Radius `--radius-xl`
- Shadow `--shadow-md`
- กว้าง 2 columns ของ grid

#### Supporting Cards

```
┌──────────┐
│ งบทำการ   │  ← label
│ ┃ ฿18.4M  │  ← bar เล็กซ้าย สี bud, value
│ 74% ของรวม│  ← sub
└──────────┘
```

- พื้นขาว, border subtle
- ตัวบ่งชี้สีคือ **bar 3px ซ้าย** ที่ขยายความสูงเต็มการ์ด (ไม่ใช่ pseudo absolute แบบเดิม — ใช้ `border-left`)
- Value font: `text-metric` (24px)
- Percentage แสดง pill เล็กข้างค่าเมื่อมี trend (ลบ tone redundant text)
- Hover: เงาเพิ่มเล็กน้อย transform translateY(-1px)

### 6.4 Bar Chart

ปรับให้เป็น **grouped horizontal bar** (ดีกว่า vertical สำหรับ 12 แผนก เพราะชื่อแผนกไทยยาว)

```
                   งบทำการ                           ZPM
กฟจ.นครราชสีมา   ▮▮▮▮▮▮▮▮▮▮▮ ฿4.2M      ▮▮▮▮ ฿1.4M
กฟจ.บุรีรัมย์    ▮▮▮▮▮▮▮▮▮ ฿3.8M        ▮▮▮ ฿0.9M
กฟจ.สุรินทร์    ▮▮▮▮▮▮▮▮ ฿3.1M         ▮▮ ฿0.5M
...
                   0  1M  2M  3M  4M  5M
```

- **Horizontal layout** สำหรับชื่อภาษาไทยยาว
- **Grouped (2 bars per dept)** ดีกว่า stacked เพราะอ่านค่า ZPM แยกได้ ไม่ต้องไล่หา baseline
- มี **value label** ท้ายแท่งทุกแถว (ไม่ต้อง hover)
- มี **grid baseline** จางๆ ทุก 1M
- เรียง **bar height = 14px**, gap ภายในกลุ่ม 2px, gap ระหว่างกลุ่ม 12px
- Animation: bars grow left → right, stagger 30ms, ease-out-expo
- Empty state: แสดงข้อความ "ยังไม่มีข้อมูลตามตัวกรอง" + icon ผังกราฟจาง

### 6.5 SPK Filter — เปลี่ยนเป็น Searchable List

68 chips ในกล่อง scroll คือปัญหา UX จริง เปลี่ยนเป็น:

```
┌───────────────────────────────────┐
│  เลือก สปก.            42/68 ✓     │  ← header + count
├───────────────────────────────────┤
│  [🔎 ค้นหารหัส/ชื่อ สปก.        ]   │  ← search input
│                                    │
│  [ทั้งหมด] [ZPM] [ยกเว้นสวัสดิการ] │  ← preset chips (sticky)
├───────────────────────────────────┤
│  ☑ 100001  งบทรัพยากรบุคคล   [Z]  │  ← row 1
│  ☑ 100002  งบเทคโนโลยีฯ         │
│  ☐ 100003  งบสวัสดิการพื้นฐาน [W]│  ← welfare badge
│  ☑ 100004  งบจัดซื้อ          [Z]│
│  ...                              │
├───────────────────────────────────┤
│  เคลียร์ทั้งหมด          ← undo →  │  ← footer actions
└───────────────────────────────────┘
```

- **Search box ที่ filter แบบ instant** (debounce 100ms ผ่าน `useDebounce`)
- **Row layout แทน chip wrap** อ่านง่ายกว่า + รหัสจัด column ตรง
- Row hover: พื้น `--surface-sunken`
- Row checked: ขอบซ้าย 3px `--accent-bud`, พื้น `--accent-bud-soft` 30%
- ปุ่ม preset เป็น **toggle** (กดซ้ำเพื่อ unset) แสดง active state ชัด
- **Sticky search + presets** เมื่อ scroll list ลง
- ปุ่ม "undo" สำหรับการกระทำล่าสุด (เผื่อพลาด)
- Keyboard nav: `↑↓` เลื่อน row, `Space` toggle, `/` focus search

### 6.6 Department Tabs + Tables

#### Tab Strip

```
┌────────────────────────────────────────────────────────┐
│ ▼ ภาพรวม │  กฟจ.A  │  กฟจ.B  │  กฟจ.C  │  ... │  →   │
└────────────────────────────────────────────────────────┘
```

- **Active tab: border-bottom 3px + bold** (ไม่ใช่ pill เต็มเหมือนเดิม — ดูทันสมัยขึ้น)
- Tab inactive: text secondary
- Scroll horizontal บนจอเล็ก พร้อม fade gradient ที่ขอบ
- เพิ่ม dropdown "▼ ภาพรวม" สำหรับโหมด jump ด่วน
- Tab มี badge ตัวเลขเล็ก: `กฟจ.A 24` = 24 รายการ

#### Overview Table

```
┌─────────────────────────────────────────────────────────────────────┐
│ แผนก         │ สัดส่วน              │ งบทำการ │  ZPM   │ รวม         │
├─────────────────────────────────────────────────────────────────────┤
│ กฟจ.A        │ ▰▰▰▰▰▰▱▱▱▱  18%   │ ฿4.2M  │ ฿1.4M  │ ฿5,600,000 │
│              │ งบ 75% · ZPM 25%   │        │        │            │
├─────────────────────────────────────────────────────────────────────┤
│ กฟจ.B        │ ▰▰▰▰▱▱▱▱▱▱  14%   │ ฿3.8M  │ ฿0.9M  │ ฿4,700,000 │
│              │ งบ 81% · ZPM 19%   │        │        │            │
├─────────────────────────────────────────────────────────────────────┤
│ TOTAL        │                    │ ฿18.4M │ ฿6.4M  │ ฿24,820,194│
└─────────────────────────────────────────────────────────────────────┘
```

- **Zebra striping** (alternating `--surface-card` / `--surface-sunken`)
- **Sticky header** เมื่อ scroll (`position: sticky; top: 0`)
- **Sticky footer row** "TOTAL" ที่ accent (พื้น `--accent-bud-soft` อ่อน)
- ค่าตัวเลขทั้งหมด **align ขวา + tabular-nums + font-mono สำหรับเฉพาะคอลัมน์ตัวเลข**
- **Sortable columns** — คลิกหัวตารางเพื่อเรียง (icon ลูกศรเล็ก)
- ค่าใน column ZPM ถ้า > 30% ของรวม: **highlight tag เล็ก** "สัดส่วน ZPM สูง"
- Row hover: เพิ่ม `outline: 2px solid --border-strong` (ไม่เปลี่ยนความสูง)

#### Detail Table (per dept)

```
┌─────────────────────────────────────────────────────────────────────┐
│ รหัส สปก. │ ชื่อบัญชี                  │ งบทำการ │  ZPM   │  %ZPM   │
├─────────────────────────────────────────────────────────────────────┤
│ 100001    │ งบทรัพยากรบุคคล             │ ฿420K  │ ฿180K  │  30%   │
│ 100002    │ งบเทคโนโลยีและสารสนเทศ      │ ฿380K  │ ฿120K  │  24%   │
│ 100003    │ งบสวัสดิการพื้นฐาน  [สวัสดิการ] │ ฿200K  │ —      │   0%   │
└─────────────────────────────────────────────────────────────────────┘
```

- รหัส สปก. ใช้ `font-mono` + บรรจุใน chip เทาเล็ก (เพิ่มความ "เป็นรหัส")
- ชื่อบัญชี: truncate ด้วย ellipsis + tooltip on hover (ถ้าตัด)
- คอลัมน์ %ZPM: แสดง **micro-bar inline 40px** ใต้เปอร์เซ็นต์
- Empty state: รูป icon ตารางว่าง + ข้อความ + ปุ่มล้างตัวกรอง

### 6.7 Buttons

```
Primary:      [ ▮ บันทึก ]      bg=--accent-bud, text white, h=40px
Secondary:    [ ▯ ยกเลิก ]      bg=transparent, border=default, text=primary
Tertiary:     [   เพิ่มเติม   ]  text-only, underline on hover
Destructive:  [ ▮ ลบ ]          bg=--color-danger
Icon:         [ ↻ ]             36×36px, only icon, aria-label จำเป็น

States: hover (shade 5%), active (shade 10%), focus (ring 3px), disabled (opacity 0.4)
Min height: 40px (touch target); mini variant 32px (สำหรับ toolbar เท่านั้น)
```

### 6.8 Form Inputs

```
┌───────────────────────────────┐
│  Label ทางการ                  │  ← text-small, font-weight 500
│  ┌─────────────────────────┐  │
│  │  placeholder…           │  │  ← h=40px, border subtle
│  └─────────────────────────┘  │
│  hint text หรือ error          │
└───────────────────────────────┘
```

- Border default → focus เปลี่ยนเป็น `--accent-bud` + ring 3px
- Error state: border `--color-danger`, hint สีแดง, icon ⚠ ข้างหน้า
- Required indicator: `*` สี `--color-danger` หลัง label
- Floating label: **ไม่ใช้** (ปัญหากับภาษาไทย)

### 6.9 Admin Upload — เปลี่ยนเป็น Modal Sheet

ลบ dock มุมขวาล่างทิ้ง เปลี่ยนเป็น **modal กลางจอ** เมื่อกดปุ่ม Admin Upload ที่ header

```
            [ ปุ่ม Admin Upload ] อยู่บน header
                         ↓ คลิก
┌──────────────────────────────────────────────────┐
│  ✕                                                │
│  อัปโหลด Snapshot ใหม่                            │
│  ต้องครบ 12 ไฟล์: ZPM + PM + งบทำการ 10 ไฟล์      │
│                                                   │
│  ┌─────────────────────────────────────────────┐│
│  │         ⊕                                    ││
│  │   ลากไฟล์มาวาง หรือคลิกเพื่อเลือก               ││
│  │   รองรับ .xls (UTF-16 TSV)                    ││
│  └─────────────────────────────────────────────┘│
│                                                   │
│  สถานะไฟล์:                                       │
│   ZPM       ✓ 1/1                                │
│   PM        ✓ 1/1                                │
│   งบทำการ   ◐ 7/10  (ขาด: L301034030, …)         │
│                                                   │
│  รายการไฟล์ที่อัปโหลด:                              │
│   ▣ ZPM.xls          ZPM       42 KB    ✕        │
│   ▣ PM.xls           PM        12 KB    ✕        │
│   ▣ L301034000.xls   งบทำการ   89 KB    ✕        │
│   ...                                             │
│                                                   │
│  [ ล้างรายการ ]              [ บันทึกลง DB → ]    │
└──────────────────────────────────────────────────┘
```

- Modal มี backdrop + focus trap + ESC close
- ปุ่ม "บันทึกลง DB" disabled ถ้ายังไม่ครบ + tooltip บอกเหตุผล
- **ChecklistProgress** เปลี่ยนจาก inline chips เป็น **3 line อ่านง่ายกว่า**
- File row มีปุ่ม ✕ ลบทีละไฟล์ (เดิมต้องเคลียร์ทั้งหมด)
- Empty drop zone มีตัวอย่าง: "ตัวอย่างชื่อไฟล์: ZPM.xls, PM.xls, L301034000.xls, …"
- Loading state: skeleton bar ที่ "บันทึกลง DB" + ห้าม close modal

### 6.10 Alerts

```
┌──────────────────────────────────────────────┐
│ ℹ  ข้อความข้อมูล                              │  ← info
│ ⚠  ข้อความเตือน                              │  ← warning (เหลือง)
│ ✕  ข้อความผิดพลาด                            │  ← danger (แดง)
│ ✓  ข้อความสำเร็จ                              │  ← success (เขียว)
└──────────────────────────────────────────────┘
```

- พื้นสี `--color-{type}-bg` อ่อน, border-left 4px เข้ม, text สี dark variant ของ semantic color
- มี icon นำ
- Dismissable: ปุ่ม ✕ ขวาบน
- Auto-dismiss สำหรับ success: 5s; error/warning: ค้างจนกว่าผู้ใช้กด

### 6.11 Empty States

```
┌──────────────────────────────────┐
│           [ icon 48px ]           │
│                                   │
│      ยังไม่มี snapshot ให้แสดง       │
│                                   │
│   อัปโหลดไฟล์ครบชุดเพื่อเริ่มต้น     │
│                                   │
│      [ เปิด Admin Upload ]        │
└──────────────────────────────────┘
```

- ไอคอนเป็น line icon มินิมัล (ไม่ใช่ emoji)
- หัวข้อ + คำอธิบาย + CTA หลัก 1 ปุ่ม
- ห้ามใช้ภาพ illustration การ์ตูน (ไม่เข้าโทนราชการ)

### 6.12 Loading States

- **Skeleton screens** สำหรับ first load (ไม่ใช่ spinner กลางจอ)
- Skeleton ใช้สี `--surface-sunken` + shimmer 1.5s loop
- Spinner เล็ก 16px สำหรับ inline action (เช่นปุ่ม submit)
- Toast "กำลังโหลด snapshot…" ที่มุมขวาบนเมื่อ refetch

---

## 7. Data Visualization

### 7.1 หลักการ

- **Categorical colors**: ใช้ `--accent-bud` กับ `--accent-zpm` เท่านั้นสำหรับ 2 series หลัก
- **เน้น value ไม่เน้นกราฟ** — value labels ติดทุกแท่ง ไม่ต้อง hover
- **Tooltips** เป็นข้อมูลเสริม (ไม่ใช่ข้อมูลหลัก)
- ทุกกราฟต้องมี **chart title + unit indicator** เช่น "หน่วย: ล้านบาท"
- Print-safe: ใช้ pattern fill + สี (ไม่พึ่งสีอย่างเดียว) สำหรับ a11y และ B&W print

### 7.2 Number Formatting

```ts
// helper เดียวกันใช้ทั้งโปรเจกต์
const fmt = {
  baht: (n: number) => `฿${n.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`,
  bahtCompact: (n: number) => {
    const abs = Math.abs(n)
    if (abs >= 1_000_000) return `฿${(n / 1_000_000).toFixed(2)}M`
    if (abs >= 1_000) return `฿${(n / 1_000).toFixed(1)}K`
    return `฿${n.toLocaleString('th-TH')}`
  },
  pct: (n: number) => `${Math.round(n)}%`,
  date: (d: Date | string) => new Date(d).toLocaleString('th-TH', {
    calendar: 'buddhist',
    dateStyle: 'long',
    timeStyle: 'short',
  }),
}
```

- **ปี พ.ศ. (Buddhist calendar)** — บังคับใช้ทุกที่ที่แสดงวันที่
- จำนวนเงิน: ใช้สัญลักษณ์ `฿` เสมอ (ไม่ใช่ "บาท" ต่อท้าย)
- ในตาราง: full number; ใน card/chart: compact (M/K)
- เปอร์เซ็นต์ปัด integer ใน card, 1 decimal ใน tooltip

### 7.3 Chart Library

แนะนำใช้ **Recharts** หรือ **Visx** (มี theming + tabular)
ไม่แนะนำ Chart.js เพราะ wrapper React ของมัน trade-off มากเกินไป

ห้ามใช้ canvas raw drawing โดยไม่จำเป็น (ปัจจุบันใช้ `<BarChart>` ที่น่าจะ canvas — ควร refactor เป็น SVG เพื่อ a11y/print)

---

## 8. Motion

### 8.1 Tokens

```css
:root {
  --duration-fast:   120ms;
  --duration-normal: 220ms;
  --duration-slow:   400ms;

  --ease-out-soft:   cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:     cubic-bezier(0.65, 0, 0.35, 1);
}
```

### 8.2 หลักการ

- **Stagger ในกราฟ**: bars 30ms delay incremental
- **Reduce motion**: รองรับ `prefers-reduced-motion` — ถ้าผู้ใช้ปิดให้ animation = 0
- **ห้าม animate width/height** ของ layout — ใช้ transform/opacity เท่านั้น
- Modal slide-up: 220ms ease-out-expo
- Number transitions: ใช้ animated count-up เฉพาะ hero metric (ไม่ใช่ทุกตัวเลข)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Accessibility (WCAG 2.2 AA — เป้าหมาย AAA สำหรับ body text)

### 9.1 บังคับ

- ทุก interactive: `aria-label` หรือ visible label
- Focus order: tab ผ่านทุก control logical (header → snapshot → metrics → chart → filter → table → admin)
- Focus indicator: ring 3px contrast ≥ 3:1
- ตารางใช้ `<table>` semantic ไม่ใช่ `<div>` (เปลี่ยนจากของเดิม)
- Color ไม่ใช้สื่อเดียว: ZPM badge ต้องมีตัวอักษร "Z" ไม่ใช่แค่จุดสีเขียว
- Min touch target: 40×40px (mobile)
- ตัวเลือก theme contrast สูง: เพิ่ม `[data-theme="high-contrast"]` ที่ขอบเข้มขึ้น text บนพื้นขาวจัด

### 9.2 Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` | Focus SPK search |
| `R` | Reload latest snapshot |
| `A` | Open Admin Upload |
| `Esc` | Close modal / clear filter focus |
| `1-9` | Jump to dept tab |
| `Ctrl/Cmd + P` | Print-friendly view |

---

## 10. Print & Export

Dashboard ต้อง **พรินต์ออกมาเป็นรายงานได้** เพราะใช้ในการประชุม

```css
@media print {
  .app-shell { width: 100%; padding: 0; }
  .admin-dock, .filter-actions button, .snapshot-strip select { display: none; }
  .panel { box-shadow: none; border: 1px solid #000; break-inside: avoid; }
  .metric-grid { grid-template-columns: repeat(5, 1fr); }
  body { background: white; color: black; }
  .accent-bud { color: black; }
  .zpm-segment { background: repeating-linear-gradient(45deg, #000 0 2px, #fff 2px 4px); }
}
```

เพิ่ม **ปุ่ม "พิมพ์รายงาน"** ใน header ที่:
1. ซ่อน admin/filter controls
2. แสดงตาราง overview แบบสมบูรณ์ ไม่ scroll
3. เพิ่ม footer: "พิมพ์ ณ {datetime} · ผู้ใช้: {user} · Snapshot: {id}"
4. หัวกระดาษ: โลโก้ + ชื่อหน่วยงาน

---

## 11. State Surface & Errors

### 11.1 Loading

- **Initial dashboard load**: skeleton ทุก section (header text เหลือเป็น bar เทา, metrics เป็น box, chart เป็น area, table 5 rows skeleton)
- **Snapshot switch**: dim เนื้อหา 60% + spinner ขวาบนของ container ที่กำลังเปลี่ยน
- **Admin upload**: progress bar % + step indicator (Parse → Validate → Save)

### 11.2 Errors

- **Network/DB error**: alert บนสุดของ dashboard + ปุ่ม "ลองใหม่"
- **Parser error per file**: list ใต้ summary + เปลี่ยน step indicator เป็น failed icon
- **Validation mismatch** (เช่น zpm_rows ≠ expected): warning alert + collapsible diff

### 11.3 Empty

- ไม่มี snapshot: hero illustration + CTA "เปิด Admin Upload"
- ไม่มี dept match กับ filter: hint "ลองเลือก สปก. อย่างน้อย 1 รายการ"

---

## 12. File Structure (Target)

```
src/
├── app/
│   ├── layout.tsx              # Font loading, theme provider
│   ├── page.tsx
│   ├── globals.css             # เฉพาะ reset + body
│   └── api/...
├── components/
│   ├── shell/
│   │   ├── AppHeader.tsx
│   │   └── SnapshotBar.tsx
│   ├── metrics/
│   │   ├── HeroMetric.tsx
│   │   └── MetricCard.tsx
│   ├── chart/
│   │   └── DeptBarChart.tsx
│   ├── filter/
│   │   ├── SpkFilter.tsx
│   │   ├── SearchInput.tsx
│   │   └── FilterRow.tsx
│   ├── table/
│   │   ├── OverviewTable.tsx
│   │   ├── DeptDetailTable.tsx
│   │   ├── TableHeader.tsx
│   │   └── TableFooter.tsx
│   ├── admin/
│   │   ├── AdminUploadModal.tsx
│   │   ├── DropZone.tsx
│   │   └── FileStatusList.tsx
│   └── ui/                     # primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Alert.tsx
│       ├── Badge.tsx
│       └── Skeleton.tsx
├── styles/
│   ├── tokens.css              # design tokens (colors, type, space)
│   ├── typography.css
│   ├── print.css
│   └── reset.css
├── lib/
│   ├── format.ts               # fmt.baht, fmt.date (พ.ศ.)
│   └── hooks/
│       ├── useDebounce.ts
│       └── usePrefersReducedMotion.ts
```

---

## 13. Implementation Order (สำหรับ agent ที่จะ apply)

1. **ติดตั้งฟอนต์** — `next/font/google` IBM Plex Sans Thai Looped ใน `app/layout.tsx`
2. **ย้าย globals.css → styles/tokens.css** — แตกเป็น tokens, typography, components
3. **เปลี่ยน theme เป็น light default** — ใช้ tokens ใหม่ทั้งหมด
4. **Header + Snapshot Bar** — refactor `DashboardClient` header, แยกเป็น `<AppHeader>`, `<SnapshotBar>`
5. **Metric Cards (hero + supporting)** — แก้ `MetricCards.tsx` รับโครง 1+4
6. **Bar Chart** — refactor `BarChart.tsx` เป็น horizontal grouped + value labels (SVG, recharts)
7. **SPK Filter** — เปลี่ยน chip wrap เป็น searchable list + presets
8. **Tables** — เปลี่ยน div grid เป็น `<table>` semantic, sticky header, zebra
9. **Admin Upload** — ลบ dock, สร้าง `AdminUploadModal` พร้อม focus trap
10. **Format helpers** — สร้าง `lib/format.ts` กลาง พร้อม Buddhist calendar
11. **Print stylesheet + ปุ่มพิมพ์**
12. **Empty/Loading/Error states** — skeleton + เนื้อหา empty
13. **Keyboard shortcuts + a11y audit**

---

## 14. Acceptance Criteria

Agent ที่นำ design นี้ไป apply ต้องผ่านทุกข้อ:

- [ ] หน้า render ด้วยฟอนต์ IBM Plex Sans Thai Looped (verify ใน DevTools)
- [ ] Light theme เป็น default; dark theme toggle ทำงาน
- [ ] WCAG 2.2 AA pass (axe-core 0 critical issues)
- [ ] ตัวเลขทุกที่ใช้ `font-variant-numeric: tabular-nums`
- [ ] วันที่ทุกที่แสดงเป็น พ.ศ.
- [ ] Metric cards มี 1 hero + 4 supporting ตามที่ระบุ
- [ ] Bar chart เป็น horizontal grouped พร้อม value labels
- [ ] SPK filter มี search input + preset toggles + row layout
- [ ] Tables ใช้ `<table>` semantic + sticky header + zebra
- [ ] Admin Upload เป็น modal กลางจอ ไม่ใช่ dock
- [ ] รองรับ `prefers-reduced-motion`
- [ ] Print preview สมบูรณ์ (Cmd+P แล้วได้รายงาน 1 หน้า)
- [ ] Keyboard nav ทำงาน: `/`, `R`, `A`, `Esc`
- [ ] ไม่มี hardcoded color/spacing — ทุกอย่างผ่าน CSS variables
- [ ] Bundle JS gzipped < 200KB (เป้า)
- [ ] Lighthouse: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95
