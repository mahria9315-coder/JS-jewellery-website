-- T026A/T026B: courier registry (TCS for Pakistan, DHL Express for
-- international) and per-order courier tracking.
--
-- Additive migration only. No existing column, row, or historical migration is
-- modified or deleted. No courier records or destinations are seeded: rows are
-- created only by an authorised administrator, and choosing a courier is never
-- treated as proof of approval. Jewellery acceptance starts NOT_ACCEPTED for
-- every record because TCS standard terms prohibit jewellery and DHL Express
-- treats it as a restricted commodity requiring approval.

-- CreateEnum
CREATE TYPE "CourierStatus" AS ENUM ('NOT_CONFIGURED', 'PENDING_VERIFICATION', 'APPROVED', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CourierScope" AS ENUM ('DOMESTIC_PK', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "CourierAccountVerification" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED');

-- CreateEnum
CREATE TYPE "JewelleryAcceptance" AS ENUM ('NOT_ACCEPTED', 'PENDING_CONFIRMATION', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "CourierFulfilmentStatus" AS ENUM ('NOT_BOOKED', 'BOOKED', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION', 'RETURNED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "courierCode" TEXT,
ADD COLUMN     "courierFulfilmentStatus" "CourierFulfilmentStatus" NOT NULL DEFAULT 'NOT_BOOKED',
ADD COLUMN     "courierName" TEXT,
ADD COLUMN     "courierTrackingNumber" TEXT;

-- CreateTable
CREATE TABLE "Courier" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "scope" "CourierScope" NOT NULL,
    "status" "CourierStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "accountVerification" "CourierAccountVerification" NOT NULL DEFAULT 'UNVERIFIED',
    "accountVerifiedAt" TIMESTAMP(3),
    "jewelleryAcceptance" "JewelleryAcceptance" NOT NULL DEFAULT 'NOT_ACCEPTED',
    "jewelleryAcceptedAt" TIMESTAMP(3),
    "approvedJewelleryCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trackingUrlTemplate" TEXT,
    "termsUrl" TEXT,
    "notes" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Courier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierDestination" (
    "id" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "chargeMinor" INTEGER,
    "estimateMinDays" INTEGER,
    "estimateMaxDays" INTEGER,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourierDestination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Courier_code_key" ON "Courier"("code");

-- CreateIndex
CREATE INDEX "Courier_status_idx" ON "Courier"("status");

-- CreateIndex
CREATE INDEX "Courier_scope_idx" ON "Courier"("scope");

-- CreateIndex
CREATE INDEX "CourierDestination_courierId_isActive_idx" ON "CourierDestination"("courierId", "isActive");

-- CreateIndex
CREATE INDEX "CourierDestination_countryCode_idx" ON "CourierDestination"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "CourierDestination_courierId_countryCode_key" ON "CourierDestination"("courierId", "countryCode");

-- CreateIndex
CREATE INDEX "Order_courierCode_idx" ON "Order"("courierCode");

-- AddForeignKey
ALTER TABLE "CourierDestination" ADD CONSTRAINT "CourierDestination_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
