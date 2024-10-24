/*
  Warnings:

  - A unique constraint covering the columns `[jwt]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Token_jwt_key" ON "Token"("jwt");
