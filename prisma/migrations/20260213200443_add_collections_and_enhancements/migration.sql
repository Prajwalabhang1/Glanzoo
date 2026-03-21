-- AlterTable
ALTER TABLE "Order" ADD COLUMN "razorpayOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN "razorpayPaymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN "razorpaySignature" TEXT;

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "banner" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SizeChart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "chartData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
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
    "collectionId" TEXT,
    "sizeChartId" TEXT,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_sizeChartId_fkey" FOREIGN KEY ("sizeChartId") REFERENCES "SizeChart" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("active", "bottomLength", "categoryId", "createdAt", "description", "fabric", "featured", "freeShipping", "id", "images", "metaDesc", "metaTitle", "name", "price", "salePrice", "sales", "shippingDays", "sku", "slug", "tags", "topLength", "updatedAt", "views", "weight") SELECT "active", "bottomLength", "categoryId", "createdAt", "description", "fabric", "featured", "freeShipping", "id", "images", "metaDesc", "metaTitle", "name", "price", "salePrice", "sales", "shippingDays", "sku", "slug", "tags", "topLength", "updatedAt", "views", "weight" FROM "Product";
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
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_slug_idx" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_active_idx" ON "Collection"("active");

-- CreateIndex
CREATE INDEX "Collection_type_idx" ON "Collection"("type");

-- CreateIndex
CREATE INDEX "SizeChart_category_idx" ON "SizeChart"("category");
