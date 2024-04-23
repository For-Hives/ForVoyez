/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "usedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" INTEGER NOT NULL,
    "api" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Usage_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Usage" ("api", "id", "tokenId", "used", "usedAt", "userId") SELECT "api", "id", "tokenId", "used", "usedAt", "userId" FROM "Usage";
DROP TABLE "Usage";
ALTER TABLE "new_Usage" RENAME TO "Usage";
CREATE TABLE "new_Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" DATETIME NOT NULL,
    "name" TEXT,
    CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("createdAt", "expiredAt", "id", "name", "userId") SELECT "createdAt", "expiredAt", "id", "name", "userId" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE TABLE "new_User" (
    "clerkId" TEXT NOT NULL PRIMARY KEY,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("clerkId", "createdAt", "credits", "updatedAt") SELECT "clerkId", "createdAt", "credits", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
