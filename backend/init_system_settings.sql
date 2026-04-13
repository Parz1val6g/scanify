CREATE TABLE IF NOT EXISTS "system_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "system_settings" ("id", "maintenance_mode", "updated_at")
VALUES (1, false, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
