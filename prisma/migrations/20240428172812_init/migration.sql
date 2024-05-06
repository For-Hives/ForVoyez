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
INSERT INTO "new_Plan" ("billingCycle", "category", "createdAt", "credits", "description", "id", "name", "packageSize", "price", "pricingScheme", "productId", "renewalIntervalCount", "renewalIntervalUnit", "setupFee", "setupFeeEnabled", "tiers", "trialIntervalCount", "trialIntervalUnit", "variantId") SELECT "billingCycle", "category", "createdAt", "credits", "description", "id", "name", "packageSize", "price", "pricingScheme", "productId", "renewalIntervalCount", "renewalIntervalUnit", "setupFee", "setupFeeEnabled", "tiers", "trialIntervalCount", "trialIntervalUnit", "variantId" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE UNIQUE INDEX "Plan_variantId_key" ON "Plan"("variantId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
