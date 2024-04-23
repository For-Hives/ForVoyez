/*
  Warnings:

  - Added the required column `jwt` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "jwt" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" DATETIME NOT NULL,
    "name" TEXT,
    CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("createdAt", "expiredAt", "id", "name", "userId") SELECT "createdAt", "expiredAt", "id", "name", "userId" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
