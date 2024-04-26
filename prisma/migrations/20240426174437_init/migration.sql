/*
  Warnings:

  - A unique constraint covering the columns `[variantId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Plan_variantId_key" ON "Plan"("variantId");
