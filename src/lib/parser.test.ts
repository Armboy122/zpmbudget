import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { buildDashboardFromFiles, REQUIRED_UPLOAD_FILE_NAMES } from './zpm-parser'

const sourceDir = join(process.cwd(), 'ต้นฉบับ')
const files = REQUIRED_UPLOAD_FILE_NAMES.map((name) => ({
  name,
  content: readFileSync(join(sourceDir, name)),
}))

const parsed = buildDashboardFromFiles(files)

assert.equal(parsed.validation.zpm_rows, 1536)
assert.equal(parsed.validation.pm_orders, 272)
assert.equal(parsed.validation.budget_files, 10)
assert.equal(parsed.spk_list.length, 68)
assert.equal(parsed.warnings.length, 0)
assert.equal(parsed.validation.zpm_total, 2390354.94)
assert.deepEqual(parsed.validation.dept_totals, {
  'ธุรการกอง': { bud: 5900328.05, zpm: 0 },
  'ผสม': { bud: 3474971.53, zpm: 1737693.29 },
  'ผอส': { bud: 4183486.62, zpm: 26370 },
  'ผรผ': { bud: 3646365.06, zpm: 372369.82 },
  'ผปค': { bud: 2628285.77, zpm: 253921.83 },
})

assert.deepEqual(
  parsed.spk_list
    .filter((item) => item.tz > 0)
    .map((item) => item.s)
    .sort(),
  ['52022010', '52022020', '52022030', '53039010', '53050010', '53051010', '53051030'],
)

console.log('parser checksum ok')
