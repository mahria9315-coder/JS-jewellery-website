-- T015/T016: product customization configuration, persisted customization
-- snapshots, and a separate production workflow.
--
-- Additive migration only. No existing column, row, or historical migration is
-- modified or deleted. No supplier, product, confirmation, or order data is
-- created.

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'COMPLETED');

-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "customizationEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "productionStatus" "ProductionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderItem"
ADD COLUMN "customizationText" TEXT,
ADD COLUMN "customizationFont" TEXT,
ADD COLUMN "customizationColour" TEXT,
ADD COLUMN "customizationInstructions" TEXT;

-- CreateTable
CREATE TABLE "ProductCustomizationConfirmation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "approvedFonts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "approvedColours" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "evidenceReference" TEXT,
    "notes" TEXT,
    "confirmedBy" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCustomizationConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderProductionStatusEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "ProductionStatus",
    "toStatus" "ProductionStatus" NOT NULL,
    "note" TEXT,
    "actorType" TEXT NOT NULL,
    "actorLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderProductionStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCustomizationConfirmation_productId_key" ON "ProductCustomizationConfirmation"("productId");

-- CreateIndex
CREATE INDEX "ProductCustomizationConfirmation_supplierId_idx" ON "ProductCustomizationConfirmation"("supplierId");

-- CreateIndex
CREATE INDEX "Product_customizationEnabled_idx" ON "Product"("customizationEnabled");

-- CreateIndex
CREATE INDEX "Order_productionStatus_idx" ON "Order"("productionStatus");

-- CreateIndex
CREATE INDEX "OrderProductionStatusEvent_orderId_createdAt_idx" ON "OrderProductionStatusEvent"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProductCustomizationConfirmation" ADD CONSTRAINT "ProductCustomizationConfirmation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCustomizationConfirmation" ADD CONSTRAINT "ProductCustomizationConfirmation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProductionStatusEvent" ADD CONSTRAINT "OrderProductionStatusEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
