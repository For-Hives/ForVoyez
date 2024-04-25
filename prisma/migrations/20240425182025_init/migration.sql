/*
  Warnings:

  - You are about to alter the column `customerId` on the `WebhookEvent` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WebhookEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventName" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "body" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "processingError" TEXT,
    "customerId" INTEGER,
    CONSTRAINT "WebhookEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WebhookEvent" ("body", "createdAt", "customerId", "eventName", "id", "processed", "processingError", "userId") SELECT "body", "createdAt", "customerId", "eventName", "id", "processed", "processingError", "userId" FROM "WebhookEvent";
DROP TABLE "WebhookEvent";
ALTER TABLE "new_WebhookEvent" RENAME TO "WebhookEvent";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
