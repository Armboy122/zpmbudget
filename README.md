# ZPM Budget Dashboard

Next.js full-stack dashboard for monthly PEA SAP export snapshots.

## Stack

- Next.js App Router
- Drizzle ORM
- Neon Postgres
- Vercel-ready serverless route handlers

## Required Environment Variables

Create `.env.local` for local development and set the same variables in Vercel.

```bash
DATABASE_URL="postgresql://..."
```

## Local Development

```bash
npm install
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

## Upload Rules

Admin upload requires exactly 12 SAP export files:

- `ZPM.xls`
- `PM.xls`
- `L301034000.xls`
- `L301034001.xls`
- `L301034010.xls`
- `L301034011.xls`
- `L301034020.xls`
- `L301034021.xls`
- `L301034030.xls`
- `L301034031.xls`
- `L301034040.xls`
- `L301034041.xls`

The files are UTF-16 TSV exports with `.xls` extensions, not real Excel workbooks.

## Verification

```bash
npm run verify
```

Expected parser checksum with the real sample files:

- `zpm_rows = 1536`
- `pm_orders = 272`
- `budget_files = 10`
- `spk_count = 68`
- `zpm_total = 2390354.94`

## Deploy To Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Set `DATABASE_URL` in Vercel Project Settings.
4. Run `npm run db:push` locally once against Neon, or run Drizzle migration from CI.
5. Deploy.

The production app loads the latest DB snapshot by default and lets users select older uploads by `created_at`.
