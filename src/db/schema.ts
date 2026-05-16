import { index, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import type { DashboardPayload, DashboardValidation } from "../lib/zpm-parser";

export type SnapshotWarnings = string[];
export type UploadedFileNames = string[];

export const dashboardSnapshots = pgTable(
  "dashboard_snapshots",
  {
    id: serial("id").primaryKey(),
    label: text("label"),
    fileBatchName: text("file_batch_name"),
    payload: jsonb("payload").$type<DashboardPayload>().notNull(),
    validation: jsonb("validation").$type<DashboardValidation>().notNull(),
    warnings: jsonb("warnings").$type<SnapshotWarnings>().notNull().default([]),
    uploadedFileNames: jsonb("uploaded_file_names").$type<UploadedFileNames>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    createdAtIdx: index("dashboard_snapshots_created_at_idx").on(table.createdAt),
  }),
);

export type DashboardSnapshot = typeof dashboardSnapshots.$inferSelect;
export type NewDashboardSnapshot = typeof dashboardSnapshots.$inferInsert;
