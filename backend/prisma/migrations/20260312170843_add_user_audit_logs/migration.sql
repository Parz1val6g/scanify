/*
  Warnings:

  - You are about to drop the `UserLogAAudit` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'STATUS_CHANGE', 'REGISTER', 'PASSWORD_RESET', 'PASSWORD_CHANGE', 'PROFILE_UPDATE', 'DELETED', 'BANNED', 'BLOCKED', 'SUSPENDED', 'REACTIVATED');

-- DropForeignKey
ALTER TABLE "UserLogAAudit" DROP CONSTRAINT "UserLogAAudit_user_id_fkey";

-- DropTable
DROP TABLE "UserLogAAudit";

-- CreateTable
CREATE TABLE "user_audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "old_status" "Status",
    "new_status" "Status",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_addr" TEXT,
    "metadata" JSONB,

    CONSTRAINT "user_audit_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_audit_logs" ADD CONSTRAINT "user_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
