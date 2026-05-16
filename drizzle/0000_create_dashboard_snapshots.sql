CREATE TABLE IF NOT EXISTS "dashboard_snapshots" (
  "id" serial PRIMARY KEY NOT NULL,
  "label" text,
  "file_batch_name" text,
  "payload" jsonb NOT NULL,
  "validation" jsonb NOT NULL,
  "warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "uploaded_file_names" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "dashboard_snapshots_created_at_idx"
  ON "dashboard_snapshots" ("created_at");
