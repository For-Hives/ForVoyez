-- AlterTable
ALTER TABLE "Usage" ADD COLUMN     "currentCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "previousCredits" INTEGER NOT NULL DEFAULT 0;
