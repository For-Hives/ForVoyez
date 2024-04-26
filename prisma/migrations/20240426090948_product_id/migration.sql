-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "productName" TEXT,
    "variantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" TEXT NOT NULL,
    "unit" INTEGER NOT NULL DEFAULT 1,
    "isUsageBased" BOOLEAN NOT NULL DEFAULT false,
    "interval" TEXT,
    "intervalCount" INTEGER,
    "trialInterval" TEXT,
    "trialIntervalCount" INTEGER,
    "sort" INTEGER
);
INSERT INTO "new_Plan" ("description", "id", "interval", "intervalCount", "isUsageBased", "name", "price", "productId", "productName", "sort", "trialInterval", "trialIntervalCount", "unit", "variantId") SELECT "description", "id", "interval", "intervalCount", "isUsageBased", "name", "price", "productId", "productName", "sort", "trialInterval", "trialIntervalCount", "unit", "variantId" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE UNIQUE INDEX "Plan_variantId_key" ON "Plan"("variantId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
