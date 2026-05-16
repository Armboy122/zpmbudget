import { NextResponse, type NextRequest } from "next/server";

import { getSnapshotById } from "../../../../db/snapshots";

export const runtime = "nodejs";

type RouteContext = {
  params:
    | Promise<{
        id: string;
      }>
    | {
        id: string;
      };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid snapshot id" }, { status: 400 });
  }

  try {
    const snapshot = await getSnapshotById(id);
    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }
    return NextResponse.json({ snapshot });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load snapshot" },
      { status: 500 },
    );
  }
}
