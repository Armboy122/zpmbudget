import { NextResponse } from "next/server";

import { listSnapshots } from "../../../db/snapshots";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snapshots = await listSnapshots();
    return NextResponse.json({ snapshots });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list snapshots" },
      { status: 500 },
    );
  }
}
