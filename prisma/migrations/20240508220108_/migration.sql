-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "usedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" INTEGER NOT NULL,
    "api" TEXT NOT NULL DEFAULT 'describe',
    "tokenId" TEXT,
    CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Usage_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Usage" ("api", "id", "tokenId", "used", "usedAt", "userId") SELECT "api", "id", "tokenId", "used", "usedAt", "userId" FROM "Usage";
DROP TABLE "Usage";
ALTER TABLE "new_Usage" RENAME TO "Usage";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
