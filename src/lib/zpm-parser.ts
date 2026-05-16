export const DEPT_MAP = {
  LSUBPC01: "ผปค",
  LSUBGS01: "ผรผ",
  LSUBSS01: "ผสม",
  LSUBEC01: "ผอส",
} as const;

export const BUDGET_DEPT_MAP = {
  L301034000: "ธุรการกอง",
  L301034001: "ธุรการกอง",
  L301034010: "ผสม",
  L301034011: "ผสม",
  L301034020: "ผรผ",
  L301034021: "ผรผ",
  L301034030: "ผปค",
  L301034031: "ผปค",
  L301034040: "ผอส",
  L301034041: "ผอส",
} as const;

export const REQUIRED_UPLOAD_FILE_NAMES = [
  "ZPM.xls",
  "PM.xls",
  "L301034000.xls",
  "L301034001.xls",
  "L301034010.xls",
  "L301034011.xls",
  "L301034020.xls",
  "L301034021.xls",
  "L301034030.xls",
  "L301034031.xls",
  "L301034040.xls",
  "L301034041.xls",
] as const;

const WELFARE_SPKS = new Set([
  "52010010",
  "52010030",
  "52010050",
  "52010990",
  "52011020",
  "52012010",
  "52012040",
  "52012060",
  "52012070",
  "52012990",
  "52020010",
  "52020030",
  "52020040",
  "52020990",
  "52021010",
  "52021020",
]);

export const ALL_DEPTS = ["ธุรการกอง", "ผสม", "ผอส", "ผรผ", "ผปค"] as const;

type DeptName = (typeof ALL_DEPTS)[number];

export type ZpmRow = {
  spk: string;
  elem_name: string;
  amount: number;
  order_no: string;
};

export type BudgetRow = {
  spk: string;
  name: string;
  actual: number;
};

export type BudgetFile = {
  cc_code: string;
  cc_name: string;
  rows: BudgetRow[];
};

export type SpkData = {
  s: string;
  n: string;
  w: boolean;
  d: Partial<Record<DeptName, { z: number; b: number }>>;
  tz: number;
  tb: number;
};

export type DashboardPayload = {
  spk_list: SpkData[];
};

export type DashboardValidation = {
  zpm_rows: number;
  pm_orders: number;
  budget_files: number;
  zpm_total: number;
  dept_totals: Record<DeptName, { bud: number; zpm: number }>;
};

export type ParsedDashboard = DashboardPayload & {
  validation: DashboardValidation;
  warnings: string[];
};

type UploadedInput = {
  name: string;
  content: ArrayBuffer | Uint8Array;
};

function decodeSapExport(content: ArrayBuffer | Uint8Array): string {
  const bytes = content instanceof Uint8Array ? content : new Uint8Array(content);
  const text = new TextDecoder("utf-16le").decode(bytes);
  return text.replace(/^\uFEFF/, "");
}

function parseAmount(value: unknown): number {
  const text = String(value ?? "").trim().replace(/,/g, "");
  if (!text || text === "-" || text === "−") {
    return 0;
  }
  return Number.parseFloat(text);
}

function headerIndexes(header: string[]): Map<string, number> {
  const result = new Map<string, number>();
  header.forEach((name, index) => {
    const key = name.trim();
    if (key) {
      result.set(key, index);
    }
  });
  return result;
}

function parseTsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === "\t") {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function keyFor(spk: string, dept: string): string {
  return `${spk}\u0000${dept}`;
}

function addAmount(map: Map<string, number>, spk: string, dept: string, amount: number): void {
  const key = keyFor(spk, dept);
  map.set(key, (map.get(key) ?? 0) + amount);
}

export function detectFileType(content: ArrayBuffer | Uint8Array): "ZPM" | "PM" | "BUDGET" | "UNKNOWN" {
  const text = decodeSapExport(content);
  if (text.includes("ValueCOCur") && text.includes("สปก.ต้นทุน")) {
    return "ZPM";
  }
  if (text.includes("UserStatus") && text.includes("ค่าจริงรวม")) {
    return "PM";
  }
  if (text.includes("ศูนย์ต้นทุน/กลุ่ม") && text.includes("ต้นทุนจริง")) {
    return "BUDGET";
  }
  return "UNKNOWN";
}

export function parseZpm(content: ArrayBuffer | Uint8Array): ZpmRow[] {
  const lines = decodeSapExport(content)
    .split(/\r?\n/)
    .filter((line) => line.trim());
  const headerPos = lines.findIndex(
    (line) => line.split("\t").length > 6 && line.includes("สปก.ต้นทุน") && line.includes("ValueCOCur"),
  );
  if (headerPos < 0) {
    return [];
  }

  const parsedRows = parseTsv(lines.slice(headerPos).join("\n"));
  const header = parsedRows.shift() ?? [];
  const indexes = headerIndexes(header);
  const spkIdx = indexes.get("สปก.ต้นทุน") ?? 2;
  const nameIdx = indexes.get("CElem.name") ?? 3;
  const amountIdx = indexes.get("ValueCOCur") ?? 10;
  const orderIdx = indexes.get("ใบสั่ง") ?? 15;
  const minLength = Math.max(spkIdx, nameIdx, amountIdx, orderIdx) + 1;

  return parsedRows.flatMap((parts) => {
    if (parts.length < minLength || (parts[1] ?? "").trim().startsWith("*")) {
      return [];
    }
    const spk = (parts[spkIdx] ?? "").trim();
    const amountText = (parts[amountIdx] ?? "").trim();
    if (!/^\d{8}$/.test(spk) || !amountText) {
      return [];
    }
    return [
      {
        spk,
        elem_name: (parts[nameIdx] ?? "").trim(),
        amount: parseAmount(amountText),
        order_no: (parts[orderIdx] ?? "").trim(),
      },
    ];
  });
}

export function parsePm(content: ArrayBuffer | Uint8Array): Record<string, string> {
  const lines = decodeSapExport(content)
    .split(/\r?\n/)
    .filter((line) => line.trim());
  const headerPos = lines.findIndex(
    (line) => line.split("\t").length > 6 && line.includes("ใบสั่ง") && line.includes("ศ.งานหลัก"),
  );
  if (headerPos < 0) {
    return {};
  }

  const parsedRows = parseTsv(lines.slice(headerPos).join("\n"));
  const header = parsedRows.shift() ?? [];
  const indexes = headerIndexes(header);
  const orderIdx = indexes.get("ใบสั่ง") ?? 3;
  const workCenterIdx = indexes.get("ศ.งานหลัก") ?? 6;
  const minLength = Math.max(orderIdx, workCenterIdx) + 1;

  return Object.fromEntries(
    parsedRows.flatMap((parts) => {
      if (parts.length < minLength) {
        return [];
      }
      const orderNo = (parts[orderIdx] ?? "").trim();
      const workCenter = (parts[workCenterIdx] ?? "").trim();
      return orderNo && workCenter ? [[orderNo, workCenter]] : [];
    }),
  );
}

export function parseBudget(content: ArrayBuffer | Uint8Array): BudgetFile {
  const lines = decodeSapExport(content).split(/\r?\n/);
  let cc_code = "";
  let cc_name = "";

  for (const line of lines.slice(0, 25)) {
    const match = /ศูนย์ต้นทุน\/กลุ่ม\t+(\S+)\t+(.*)/.exec(line);
    if (match) {
      cc_code = match[1].trim();
      cc_name = match[2].trim();
      break;
    }
  }

  const start = lines.findIndex((line) => line.includes("ส่วนประกอบต้นทุน") && line.includes("ต้นทุนจริง"));
  if (start < 0) {
    return { cc_code, cc_name, rows: [] };
  }

  const rows: BudgetRow[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/\t\s+89\d{6}/.test(line) || /\t\*\s+เครดิต/.test(line)) {
      break;
    }
    if (line.startsWith("\t*")) {
      continue;
    }
    const parts = line.split("\t");
    if (parts.length <= 4) {
      continue;
    }
    const match = /\s*(\d{8})\s{2,}(.+)/.exec(parts[1] ?? "");
    const actualText = (parts[4] ?? "").trim();
    if (!match || !actualText) {
      continue;
    }
    rows.push({
      spk: match[1],
      name: match[2].trim(),
      actual: parseAmount(actualText),
    });
  }

  return { cc_code, cc_name, rows };
}

export function buildSpkData(zpmRows: ZpmRow[], pmMap: Record<string, string>, budgetFiles: BudgetFile[]): SpkData[] {
  const zpmByKey = new Map<string, number>();
  const budgetByKey = new Map<string, number>();
  const names = new Map<string, string>();

  for (const row of zpmRows) {
    const spk = row.spk.trim();
    if (!spk) {
      continue;
    }
    if (!names.has(spk)) {
      names.set(spk, row.elem_name.trim());
    }
    const dept = DEPT_MAP[pmMap[row.order_no.trim()] as keyof typeof DEPT_MAP];
    if (dept) {
      addAmount(zpmByKey, spk, dept, row.amount || 0);
    }
  }

  for (const item of budgetFiles) {
    const dept = BUDGET_DEPT_MAP[item.cc_code as keyof typeof BUDGET_DEPT_MAP];
    if (!dept) {
      continue;
    }
    for (const row of item.rows) {
      const spk = row.spk.trim();
      if (!spk) {
        continue;
      }
      if (!names.has(spk)) {
        names.set(spk, row.name.trim());
      }
      addAmount(budgetByKey, spk, dept, row.actual || 0);
    }
  }

  const spks = new Set<string>();
  for (const key of [...zpmByKey.keys(), ...budgetByKey.keys()]) {
    spks.add(key.split("\u0000")[0]);
  }

  return [...spks]
    .map((spk) => {
      const deptData: SpkData["d"] = {};
      let totalZpm = 0;
      let totalBudget = 0;

      for (const dept of ALL_DEPTS) {
        const zpmAmount = round2(zpmByKey.get(keyFor(spk, dept)) ?? 0);
        const budgetAmount = round2(budgetByKey.get(keyFor(spk, dept)) ?? 0);
        if (zpmAmount || budgetAmount) {
          deptData[dept] = { z: zpmAmount, b: budgetAmount };
        }
        totalZpm += zpmAmount;
        totalBudget += budgetAmount;
      }

      return {
        s: spk,
        n: names.get(spk) ?? "",
        w: WELFARE_SPKS.has(spk),
        d: deptData,
        tz: round2(totalZpm),
        tb: round2(totalBudget),
      };
    })
    .sort((left, right) => {
      const amountDiff = right.tz + right.tb - (left.tz + left.tb);
      return amountDiff || right.s.localeCompare(left.s);
    });
}

export function validateUploadFileNames(fileNames: string[]): { missing: string[]; unexpected: string[]; duplicates: string[] } {
  const required = new Set<string>(REQUIRED_UPLOAD_FILE_NAMES);
  const counts = new Map<string, number>();
  for (const name of fileNames) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return {
    missing: REQUIRED_UPLOAD_FILE_NAMES.filter((name) => !counts.has(name)),
    unexpected: fileNames.filter((name) => !required.has(name)),
    duplicates: [...counts.entries()].filter(([, count]) => count > 1).map(([name]) => name),
  };
}

export function buildDashboardFromFiles(files: UploadedInput[]): ParsedDashboard {
  const fileNameValidation = validateUploadFileNames(files.map((file) => file.name));
  const fileErrors = [
    ...fileNameValidation.missing.map((name) => `missing required file: ${name}`),
    ...fileNameValidation.unexpected.map((name) => `unexpected file: ${name}`),
    ...fileNameValidation.duplicates.map((name) => `duplicate file: ${name}`),
  ];
  if (fileErrors.length) {
    throw new Error(fileErrors.join("; "));
  }

  const zpmRows: ZpmRow[] = [];
  const pmMap: Record<string, string> = {};
  const budgetFiles: BudgetFile[] = [];
  const warnings: string[] = [];

  for (const uploaded of files) {
    const fileType = detectFileType(uploaded.content);
    if (fileType === "ZPM") {
      zpmRows.push(...parseZpm(uploaded.content));
    } else if (fileType === "PM") {
      Object.assign(pmMap, parsePm(uploaded.content));
    } else if (fileType === "BUDGET") {
      budgetFiles.push(parseBudget(uploaded.content));
    } else {
      warnings.push(`${uploaded.name}: unknown file type`);
    }
  }

  if (zpmRows.length && !Object.keys(pmMap).length) {
    warnings.push("ไม่พบไฟล์ PM: รายการ ZPM จะยังไม่สามารถแยกตามแผนกได้");
  }

  const zpmOrderNumbers = new Set(zpmRows.map((row) => row.order_no.trim()).filter(Boolean));
  const missingOrders = [...zpmOrderNumbers].filter((orderNo) => !pmMap[orderNo]).sort();
  if (missingOrders.length) {
    const preview = missingOrders.slice(0, 5).join(", ");
    warnings.push(`พบใบสั่ง ZPM ที่ไม่มีใน PM ${missingOrders.length} รายการ: ${preview}${missingOrders.length > 5 ? "..." : ""}`);
  }

  const unknownWorkCenters = [...new Set([...zpmOrderNumbers].map((orderNo) => pmMap[orderNo]).filter(Boolean))]
    .filter((workCenter) => !DEPT_MAP[workCenter as keyof typeof DEPT_MAP])
    .sort();
  if (unknownWorkCenters.length) {
    warnings.push(`พบศูนย์งาน PM ที่ยังไม่อยู่ใน DEPT_MAP: ${unknownWorkCenters.join(", ")}`);
  }

  const unknownBudgetCodes = [...new Set(budgetFiles.map((file) => file.cc_code).filter(Boolean))]
    .filter((ccCode) => !BUDGET_DEPT_MAP[ccCode as keyof typeof BUDGET_DEPT_MAP])
    .sort();
  if (unknownBudgetCodes.length) {
    warnings.push(`พบศูนย์ต้นทุนงบทำการที่ยังไม่อยู่ใน BUDGET_DEPT_MAP: ${unknownBudgetCodes.join(", ")}`);
  }

  const spkList = buildSpkData(zpmRows, pmMap, budgetFiles);
  const deptTotals = Object.fromEntries(ALL_DEPTS.map((dept) => [dept, { bud: 0, zpm: 0 }])) as DashboardValidation["dept_totals"];
  for (const item of spkList) {
    for (const [dept, amounts] of Object.entries(item.d) as [DeptName, { z: number; b: number }][]) {
      deptTotals[dept].bud = round2(deptTotals[dept].bud + (amounts.b || 0));
      deptTotals[dept].zpm = round2(deptTotals[dept].zpm + (amounts.z || 0));
    }
  }

  return {
    spk_list: spkList,
    validation: {
      zpm_rows: zpmRows.length,
      pm_orders: Object.keys(pmMap).length,
      budget_files: budgetFiles.filter((file) => BUDGET_DEPT_MAP[file.cc_code as keyof typeof BUDGET_DEPT_MAP]).length,
      zpm_total: round2(zpmRows.reduce((total, row) => total + (row.amount || 0), 0)),
      dept_totals: deptTotals,
    },
    warnings,
  };
}
