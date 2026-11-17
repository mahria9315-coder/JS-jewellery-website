-- T060: generic courier registry. Adds an optional owner-entered contact
-- details field to the courier registry so courier companies can be managed
-- without any provider-specific integration.
--
-- Additive migration only. No existing column, row, or historical migration
-- is modified or deleted, and no courier data is seeded.

ALTER TABLE "Courier" ADD COLUMN "contactDetails" TEXT;
