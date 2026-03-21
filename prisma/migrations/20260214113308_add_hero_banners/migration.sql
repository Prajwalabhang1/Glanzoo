-- CreateTable
CREATE TABLE "HeroBanner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT NOT NULL,
    "imagePosition" TEXT NOT NULL DEFAULT 'center center',
    "badge" TEXT,
    "title" TEXT NOT NULL,
    "titleAccent" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryCtaText" TEXT NOT NULL DEFAULT 'Shop Now',
    "primaryCtaLink" TEXT NOT NULL DEFAULT '/products',
    "secondaryCtaText" TEXT,
    "secondaryCtaLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "HeroBanner_active_order_idx" ON "HeroBanner"("active", "order");
