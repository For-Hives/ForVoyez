/*
  Warnings:

  - You are about to drop the column `interval` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `intervalCount` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `isUsageBased` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `sort` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `trialInterval` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Plan` table. All the data in the column will be lost.
  - Added the required column `billingCycle` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricingScheme` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "billingCycle" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pricingScheme" TEXT NOT NULL,
    "setupFeeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "setupFee" INTEGER,
    "packageSize" INTEGER,
    "tiers" TEXT,
    "renewalIntervalUnit" TEXT,
    "renewalIntervalCount" INTEGER,
    "trialIntervalUnit" TEXT,
    "trialIntervalCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Plan" ("description", "id", "name", "price", "productId", "trialIntervalCount", "variantId") SELECT "description", "id", "name", "price", "productId", "trialIntervalCount", "variantId" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
