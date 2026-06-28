-- CreateTable
CREATE TABLE "MarketTypeConfig" (
    "id" TEXT NOT NULL,
    "marketType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketTypeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketTypeConfig_marketType_key" ON "MarketTypeConfig"("marketType");

-- CreateIndex
CREATE INDEX "MarketTypeConfig_isEnabled_sortOrder_idx" ON "MarketTypeConfig"("isEnabled", "sortOrder");
