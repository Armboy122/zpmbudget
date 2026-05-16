import { desc, eq } from "drizzle-orm";

import { getDb } from "./index";
import { dashboardSnapshots, type NewDashboardSnapshot } from "./schema";

export async function listSnapshots() {
  return getDb()
    .select({
      id: dashboardSnapshots.id,
      label: dashboardSnapshots.label,
      fileBatchName: dashboardSnapshots.fileBatchName,
      validation: dashboardSnapshots.validation,
      warnings: dashboardSnapshots.warnings,
      uploadedFileNames: dashboardSnapshots.uploadedFileNames,
      createdAt: dashboardSnapshots.createdAt,
    })
    .from(dashboardSnapshots)
    .orderBy(desc(dashboardSnapshots.createdAt));
}

export async function getLatestSnapshot() {
  const [snapshot] = await getDb().select().from(dashboardSnapshots).orderBy(desc(dashboardSnapshots.createdAt)).limit(1);
  return snapshot ?? null;
}

export async function getSnapshotById(id: number) {
  const [snapshot] = await getDb().select().from(dashboardSnapshots).where(eq(dashboardSnapshots.id, id)).limit(1);
  return snapshot ?? null;
}

export async function createSnapshot(values: NewDashboardSnapshot) {
  const [snapshot] = await getDb().insert(dashboardSnapshots).values(values).returning();
  return snapshot;
}
