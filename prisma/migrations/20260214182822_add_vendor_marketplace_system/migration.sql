-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "bankDetails" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvalNotes" TEXT,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "commissionRate" REAL NOT NULL DEFAULT 10.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productTotal" REAL NOT NULL,
    "commissionRate" REAL NOT NULL,
    "commissionAmount" REAL NOT NULL,
    "vendorPayout" REAL NOT NULL,
    "payoutStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "payoutDate" DATETIME,
    "payoutReference" TEXT,
    "payoutNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VendorSale_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VendorSale_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "price" REAL NOT NULL,
    "material" TEXT,
    "fabricType" TEXT,
    "specifications" TEXT,
    "salePrice" REAL,
    "images" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "freeShipping" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "fabric" TEXT,
    "topLength" TEXT,
    "bottomLength" TEXT,
    "careInstructions" TEXT,
    "washCare" TEXT,
    "shippingDays" TEXT NOT NULL DEFAULT '3-10 days',
    "tags" TEXT,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "sku" TEXT,
    "displaySku" TEXT,
    "weight" REAL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "returnEligible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "vendorId" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "rejectionReason" TEXT,
    "collectionId" TEXT,
    "sizeChartId" TEXT,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_sizeChartId_fkey" FOREIGN KEY ("sizeChartId") REFERENCES "SizeChart" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("active", "bottomLength", "careInstructions", "categoryId", "collectionId", "createdAt", "description", "displaySku", "fabric", "fabricType", "featured", "freeShipping", "id", "images", "material", "metaDesc", "metaTitle", "name", "price", "returnEligible", "salePrice", "sales", "shippingDays", "shortDescription", "sizeChartId", "sku", "slug", "specifications", "tags", "topLength", "updatedAt", "views", "washCare", "weight") SELECT "active", "bottomLength", "careInstructions", "categoryId", "collectionId", "createdAt", "description", "displaySku", "fabric", "fabricType", "featured", "freeShipping", "id", "images", "material", "metaDesc", "metaTitle", "name", "price", "returnEligible", "salePrice", "sales", "shippingDays", "shortDescription", "sizeChartId", "sku", "slug", "specifications", "tags", "topLength", "updatedAt", "views", "washCare", "weight" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_collectionId_idx" ON "Product"("collectionId");
CREATE INDEX "Product_sizeChartId_idx" ON "Product"("sizeChartId");
CREATE INDEX "Product_featured_idx" ON "Product"("featured");
CREATE INDEX "Product_active_idx" ON "Product"("active");
CREATE INDEX "Product_slug_idx" ON "Product"("slug");
CREATE INDEX "Product_vendorId_idx" ON "Product"("vendorId");
CREATE INDEX "Product_approvalStatus_idx" ON "Product"("approvalStatus");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userId_key" ON "Vendor"("userId");

-- CreateIndex
CREATE INDEX "Vendor_userId_idx" ON "Vendor"("userId");

-- CreateIndex
CREATE INDEX "Vendor_status_idx" ON "Vendor"("status");

-- CreateIndex
CREATE INDEX "Vendor_businessName_idx" ON "Vendor"("businessName");

-- CreateIndex
CREATE INDEX "VendorSale_vendorId_idx" ON "VendorSale"("vendorId");

-- CreateIndex
CREATE INDEX "VendorSale_orderId_idx" ON "VendorSale"("orderId");

-- CreateIndex
CREATE INDEX "VendorSale_payoutStatus_idx" ON "VendorSale"("payoutStatus");

-- CreateIndex
CREATE INDEX "VendorSale_createdAt_idx" ON "VendorSale"("createdAt");
