-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'BLOCKED', 'DELETED', 'BANNED');

-- CreateTable
CREATE TABLE "UserLogAAudit" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldStatus" "Status" NOT NULL,
    "newStatus" "Status" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ipAddr" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,

    CONSTRAINT "UserLogAAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserLogAAudit" ADD CONSTRAINT "UserLogAAudit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
