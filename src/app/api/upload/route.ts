import { NextResponse, type NextRequest } from "next/server";

import { createSnapshot } from "../../../db/snapshots";
import { buildDashboardFromFiles } from "../../../lib/zpm-parser";

export const runtime = "nodejs";

type UploadFile = {
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function isUploadFile(value: FormDataEntryValue): value is UploadFile & FormDataEntryValue {
  return typeof value === "object" && value !== null && "name" in value && "arrayBuffer" in value;
}

function cleanOptionalText(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data upload" }, { status: 400 });
  }

  const uploads = [...formData.values()].filter(isUploadFile);
  if (!uploads.length) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  let files: { name: string; content: ArrayBuffer }[];
  let parsed: ReturnType<typeof buildDashboardFromFiles>;
  try {
    files = await Promise.all(
      uploads.map(async (file) => ({
        name: file.name,
        content: await file.arrayBuffer(),
      })),
    );
    parsed = buildDashboardFromFiles(files);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload parse failed" },
      { status: 400 },
    );
  }

  const uploadedFileNames = files.map((file) => file.name).sort();
  const label = cleanOptionalText(formData.get("label"));
  const fileBatchName = cleanOptionalText(formData.get("file_batch_name")) ?? cleanOptionalText(formData.get("fileBatchName"));

  try {
    const snapshot = await createSnapshot({
      label,
      fileBatchName,
      payload: { spk_list: parsed.spk_list },
      validation: parsed.validation,
      warnings: parsed.warnings,
      uploadedFileNames,
    });

    return NextResponse.json(
      {
        snapshot,
        spk_list: parsed.spk_list,
        validation: parsed.validation,
        warnings: parsed.warnings,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save snapshot" },
      { status: 500 },
    );
  }
}
