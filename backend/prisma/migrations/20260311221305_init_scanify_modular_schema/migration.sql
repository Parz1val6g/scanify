-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('READ', 'WRITE');

-- CreateTable
CREATE TABLE "SharedInvoiceAudit" (
    "id" TEXT NOT NULL,
    "shared_invoice_id" TEXT NOT NULL,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "permissionType" "PermissionType" NOT NULL DEFAULT 'READ',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedInvoiceAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SharedInvoiceAudit" ADD CONSTRAINT "SharedInvoiceAudit_shared_invoice_id_fkey" FOREIGN KEY ("shared_invoice_id") REFERENCES "shared_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedInvoiceAudit" ADD CONSTRAINT "SharedInvoiceAudit_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedInvoiceAudit" ADD CONSTRAINT "SharedInvoiceAudit_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
