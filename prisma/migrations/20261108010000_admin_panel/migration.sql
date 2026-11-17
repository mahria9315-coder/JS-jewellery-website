-- CreateEnum
CREATE TYPE "AdminRoleKey" AS ENUM ('SUPER_ADMIN', 'MANAGER', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER');

-- CreateEnum
CREATE TYPE "AdminAccountStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SupplierStatus" ADD VALUE 'DRAFT';
ALTER TYPE "SupplierStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "internalNotes" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;

-- AlterTable
ALTER TABLE "ReturnRequest" ADD COLUMN     "conditionNotes" TEXT,
ADD COLUMN     "deductionReason" TEXT,
ADD COLUMN     "receivedAt" TIMESTAMP(3),
ADD COLUMN     "receivedBy" TEXT;

-- AlterTable
ALTER TABLE "SupplierAgreement" ADD COLUMN     "documentPath" TEXT;

-- CreateTable
CREATE TABLE "SupplierNote" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageSrc" TEXT,
    "imageAlt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "logoSrc" TEXT,
    "logoAlt" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "previousStock" INTEGER,
    "newStock" INTEGER,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "actor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRole" (
    "id" TEXT NOT NULL,
    "key" "AdminRoleKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" "AdminAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "postalCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "estimateMinDays" INTEGER NOT NULL DEFAULT 4,
    "estimateMaxDays" INTEGER NOT NULL DEFAULT 7,
    "deliveryNote" TEXT NOT NULL DEFAULT 'Delivery timing is an estimate, not a guarantee.',
    "internationalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingZone" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "estimateMinDays" INTEGER,
    "estimateMaxDays" INTEGER,
    "chargeMinor" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'business',
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "PaymentSetting" (
    "method" "PaymentMethod" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "displayLabel" TEXT NOT NULL,
    "publicInstructions" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSetting_pkey" PRIMARY KEY ("method")
);

-- CreateTable
CREATE TABLE "ContentPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT NOT NULL DEFAULT '',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isIndexable" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSection" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "imageSrc" TEXT,
    "imageAlt" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageVersion" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL,
    "note" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "heading" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "placeholderTitle" TEXT NOT NULL DEFAULT '',
    "placeholderNote" TEXT NOT NULL DEFAULT '',
    "tone" TEXT NOT NULL DEFAULT 'light',
    "imageSrc" TEXT,
    "imageAlt" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationItem" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoMetadata" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "ogImageSrc" TEXT,
    "canonicalPath" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "sitemapInclude" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupplierNote_supplierId_createdAt_idx" ON "SupplierNote"("supplierId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_isPublished_sortOrder_idx" ON "Category"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "Category_featured_idx" ON "Category"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_isPublished_idx" ON "Brand"("isPublished");

-- CreateIndex
CREATE INDEX "InventoryMovement_productId_createdAt_idx" ON "InventoryMovement"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRole_key_key" ON "AdminRole"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_roleId_idx" ON "AdminUser"("roleId");

-- CreateIndex
CREATE INDEX "AdminUser_status_idx" ON "AdminUser"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE INDEX "CustomerNote_customerId_createdAt_idx" ON "CustomerNote"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingZone_countryCode_key" ON "ShippingZone"("countryCode");

-- CreateIndex
CREATE INDEX "ShippingZone_isActive_sortOrder_idx" ON "ShippingZone"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPage_slug_key" ON "ContentPage"("slug");

-- CreateIndex
CREATE INDEX "ContentPage_status_idx" ON "ContentPage"("status");

-- CreateIndex
CREATE INDEX "ContentSection_pageId_sortOrder_idx" ON "ContentSection"("pageId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ContentSection_pageId_sectionKey_key" ON "ContentSection"("pageId", "sectionKey");

-- CreateIndex
CREATE INDEX "PageVersion_pageId_createdAt_idx" ON "PageVersion"("pageId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HomeSection_key_key" ON "HomeSection"("key");

-- CreateIndex
CREATE INDEX "NavigationItem_location_sortOrder_idx" ON "NavigationItem"("location", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_url_key" ON "MediaAsset"("url");

-- CreateIndex
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_path_key" ON "SeoMetadata"("path");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_featured_idx" ON "Product"("featured");

-- CreateIndex
CREATE INDEX "Product_isArchived_idx" ON "Product"("isArchived");

-- AddForeignKey
ALTER TABLE "SupplierNote" ADD CONSTRAINT "SupplierNote_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSection" ADD CONSTRAINT "ContentSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "ContentPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageVersion" ADD CONSTRAINT "PageVersion_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "ContentPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: fixed administrator roles. Permissions are enforced server-side.
INSERT INTO "AdminRole" ("id", "key", "name", "description", "permissions", "createdAt", "updatedAt") VALUES
(
  'role_super_admin',
  'SUPER_ADMIN',
  'Super Admin',
  'Full access to every administration area, including users, roles, and server-only payment configuration.',
  ARRAY[
    'dashboard.view','reports.view','products.view','products.manage','products.publish',
    'inventory.view','inventory.manage','suppliers.view','suppliers.manage','suppliers.verify',
    'categories.view','categories.manage','orders.view','orders.manage','orders.cancel',
    'payments.view','payments.verify','payments.configure','returns.view','returns.manage',
    'refunds.process','customers.view','customers.manage','shipping.view','shipping.manage',
    'content.view','content.manage','content.publish','media.manage','navigation.manage',
    'seo.manage','settings.manage','users.manage','roles.manage','audit.view'
  ],
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'role_manager',
  'MANAGER',
  'Manager',
  'Day-to-day store operations. Cannot manage administrator accounts or server-only payment credentials.',
  ARRAY[
    'dashboard.view','reports.view','products.view','products.manage','products.publish',
    'inventory.view','inventory.manage','suppliers.view','suppliers.manage','suppliers.verify',
    'categories.view','categories.manage','orders.view','orders.manage','orders.cancel',
    'payments.view','payments.verify','returns.view','returns.manage','refunds.process',
    'customers.view','customers.manage','shipping.view','shipping.manage','content.view',
    'content.manage','content.publish','media.manage','navigation.manage','seo.manage',
    'settings.manage','audit.view'
  ],
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'role_product_manager',
  'PRODUCT_MANAGER',
  'Product Manager',
  'Supplier-linked catalogue, inventory, taxonomy, and product media. No order payment or refund access.',
  ARRAY[
    'dashboard.view','reports.view','products.view','products.manage','products.publish',
    'inventory.view','inventory.manage','suppliers.view','categories.view','categories.manage',
    'media.manage','seo.manage','audit.view'
  ],
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'role_order_manager',
  'ORDER_MANAGER',
  'Order Manager',
  'Order handling, customer records, returns intake, and shipping settings. Cannot verify payments or process refunds.',
  ARRAY[
    'dashboard.view','reports.view','products.view','inventory.view','orders.view',
    'orders.manage','orders.cancel','returns.view','returns.manage','customers.view',
    'customers.manage','shipping.view','audit.view'
  ],
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'role_finance_manager',
  'FINANCE_MANAGER',
  'Finance Manager',
  'Payment verification, refund processing, and financial reporting. Cannot edit catalogue or content.',
  ARRAY[
    'dashboard.view','reports.view','orders.view','payments.view','payments.verify',
    'returns.view','refunds.process','audit.view'
  ],
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'role_content_manager',
  'CONTENT_MANAGER',
  'Content Manager',
  'Homepage, pages, navigation, media, and SEO content. Cannot publish products, verify payments, or process refunds.',
  ARRAY[
    'dashboard.view','products.view','categories.view','content.view','content.manage',
    'content.publish','media.manage','navigation.manage','seo.manage','audit.view'
  ],
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO NOTHING;

-- Seed: safe, verifiable business settings. Contact details are intentionally
-- left unset until the owner supplies them.
INSERT INTO "BusinessSetting" ("key", "value", "group", "updatedBy", "updatedAt") VALUES
('store.name', 'JS Jewellers', 'business', NULL, CURRENT_TIMESTAMP),
('store.currency', 'PKR', 'business', NULL, CURRENT_TIMESTAMP),
('store.countryCode', 'PK', 'business', NULL, CURRENT_TIMESTAMP),
('returns.windowDays', '3', 'returns', NULL, CURRENT_TIMESTAMP),
('returns.changeOfMindDeductionPercent', '25', 'returns', NULL, CURRENT_TIMESTAMP),
('returns.legalReviewStatus', 'PENDING_OWNER_APPROVAL', 'returns', NULL, CURRENT_TIMESTAMP),
('shipping.estimateMinDays', '4', 'shipping', NULL, CURRENT_TIMESTAMP),
('shipping.estimateMaxDays', '7', 'shipping', NULL, CURRENT_TIMESTAMP),
('shipping.internationalEnabled', 'false', 'shipping', NULL, CURRENT_TIMESTAMP),
('payments.verificationMode', 'MANUAL', 'payments', NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- Seed: shipping defaults. Delivery timing is an estimate, not a guarantee.
INSERT INTO "ShippingSetting" ("id", "estimateMinDays", "estimateMaxDays", "deliveryNote", "internationalEnabled", "updatedBy", "updatedAt") VALUES
(
  'default',
  4,
  7,
  'Delivery timing is an estimate, not a guarantee. Orders are delivered within Pakistan only.',
  false,
  NULL,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ShippingZone" ("id", "countryCode", "name", "isActive", "estimateMinDays", "estimateMaxDays", "chargeMinor", "notes", "sortOrder", "updatedAt") VALUES
(
  'zone_pk',
  'PK',
  'Pakistan',
  true,
  4,
  7,
  0,
  'Delivery charge is confirmed by the store before dispatch. Timing is an estimate, not a guarantee.',
  0,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("countryCode") DO NOTHING;

-- Seed: approved manual payment methods start disabled. Account details are
-- supplied only through server-side environment variables, never seeded here.
INSERT INTO "PaymentSetting" ("method", "enabled", "displayLabel", "publicInstructions", "updatedBy", "updatedAt") VALUES
('BANK_TRANSFER', false, 'Bank Transfer (Islamic Bank)', NULL, NULL, CURRENT_TIMESTAMP),
('EASYPAISA', false, 'Easypaisa', NULL, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("method") DO NOTHING;

-- Seed: homepage sections mirroring the currently approved static copy so the
-- storefront can fall back safely while content is edited in the CMS.
INSERT INTO "HomeSection" ("id", "key", "eyebrow", "heading", "description", "placeholderTitle", "placeholderNote", "tone", "imageSrc", "imageAlt", "ctaLabel", "ctaHref", "sortOrder", "isVisible", "updatedBy", "updatedAt") VALUES
(
  'home_new_arrivals',
  'new-arrivals',
  'New arrivals',
  'New Arrivals',
  'New additions to the store will be listed here as approved products become available.',
  'Awaiting approved products',
  'New arrivals will be shown here once approved supplier-backed products are configured.',
  'muted',
  NULL, NULL, NULL, NULL, 10, true, NULL, CURRENT_TIMESTAMP
),
(
  'home_best_sellers',
  'best-sellers',
  'Best sellers',
  'Best Sellers',
  'This section will show best sellers based on genuine sales data or approved manual merchandising.',
  'Awaiting sales or merchandising data',
  'Best sellers will be shown here once genuine sales data or approved manual merchandising is available.',
  'light',
  NULL, NULL, NULL, NULL, 20, true, NULL, CURRENT_TIMESTAMP
),
(
  'home_special_offers',
  'special-offers',
  'Offers',
  'Special Offers',
  'Offers will be shown here only when genuine discounts are configured.',
  'No current offers',
  'There are no special offers at the moment.',
  'muted',
  NULL, NULL, NULL, NULL, 30, true, NULL, CURRENT_TIMESTAMP
),
(
  'home_featured_jewellery',
  'featured-jewellery',
  'Featured',
  'Featured Jewellery',
  'Featured pieces will be shown here when owner-approved products are available.',
  'Awaiting approved products',
  'Featured jewellery will appear once owner-approved supplier products are configured.',
  'light',
  NULL, NULL, NULL, NULL, 40, true, NULL, CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO NOTHING;

-- Seed: primary and policy navigation matching the approved static links.
INSERT INTO "NavigationItem" ("id", "location", "label", "href", "sortOrder", "isVisible", "createdAt", "updatedAt") VALUES
('nav_primary_home', 'primary', 'Home', '/', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('nav_primary_collections', 'primary', 'Collections', '/collections', 20, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('nav_primary_customized', 'primary', 'Customized Name', '/collections/customized-name-jewellery', 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('nav_primary_search', 'primary', 'Search', '/search', 40, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('nav_primary_cart', 'primary', 'Cart', '/cart', 50, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('nav_policy_privacy', 'footer-policy', 'Privacy Policy', '/privacy', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('nav_policy_returns', 'footer-policy', 'Returns & Exchanges', '/returns', 20, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('nav_policy_shipping', 'footer-policy', 'Shipping & Delivery', '/shipping', 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Seed: content page stubs. They stay DRAFT so the public site keeps using the
-- existing approved static policy pages until content is approved and published.
INSERT INTO "ContentPage" ("id", "slug", "title", "intro", "status", "isIndexable", "publishedAt", "updatedBy", "createdAt", "updatedAt") VALUES
('page_privacy', 'privacy', 'Privacy Policy', 'How JS Jewellers collects, uses, and protects customer information.', 'DRAFT', false, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('page_returns', 'returns', 'Returns & Exchanges', 'Return and exchange terms for orders delivered in Pakistan.', 'DRAFT', false, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('page_shipping', 'shipping', 'Shipping & Delivery', 'Delivery expectations for orders within Pakistan.', 'DRAFT', false, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

