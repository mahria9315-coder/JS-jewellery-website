-- T064: administrator multi-factor authentication.
--
-- Additive only. Secrets are stored as an AES-256-GCM envelope; recovery codes
-- are stored as scrypt hashes. Deleting an administrator cascades to both
-- tables so no orphaned authenticator material remains.

-- CreateTable
CREATE TABLE "AdminMfaCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedSecret" TEXT NOT NULL,
    "lastUsedCounter" INTEGER NOT NULL DEFAULT 0,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminMfaCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminMfaRecoveryCode" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminMfaRecoveryCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminMfaCredential_userId_key" ON "AdminMfaCredential"("userId");

-- CreateIndex
CREATE INDEX "AdminMfaCredential_confirmedAt_idx" ON "AdminMfaCredential"("confirmedAt");

-- CreateIndex
CREATE INDEX "AdminMfaRecoveryCode_credentialId_idx" ON "AdminMfaRecoveryCode"("credentialId");

-- CreateIndex
CREATE INDEX "AdminMfaRecoveryCode_usedAt_idx" ON "AdminMfaRecoveryCode"("usedAt");

-- AddForeignKey
ALTER TABLE "AdminMfaCredential" ADD CONSTRAINT "AdminMfaCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminMfaRecoveryCode" ADD CONSTRAINT "AdminMfaRecoveryCode_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "AdminMfaCredential"("id") ON DELETE CASCADE ON UPDATE CASCADE;
