import { NextResponse } from "next/server";

import { getLatestSnapshot } from "../../../../db/snapshots";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snapshot = await getLatestSnapshot();
    if (!snapshot) {
      return NextResponse.json({ error: "No snapshots found" }, { status: 404 });
    }
    return NextResponse.json({ snapshot });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load latest snapshot" },
      { status: 500 },
    );
  }
}
