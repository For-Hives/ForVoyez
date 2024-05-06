/*
  Warnings:

  - You are about to drop the column `category` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `pricingScheme` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `renewalIntervalCount` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `renewalIntervalUnit` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `setupFee` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `setupFeeEnabled` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `tiers` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `trialIntervalCount` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `trialIntervalUnit` on the `Plan` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "variantEnabled" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "packageSize" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mostPopular" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT NOT NULL DEFAULT '',
    "buttonText" TEXT NOT NULL DEFAULT 'Subscribe'
);
INSERT INTO "new_Plan" ("billingCycle", "createdAt", "description", "id", "name", "packageSize", "price", "productId", "variantEnabled", "variantId") SELECT "billingCycle", "createdAt", "description", "id", "name", "packageSize", "price", "productId", "variantEnabled", "variantId" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE UNIQUE INDEX "Plan_variantId_key" ON "Plan"("variantId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
