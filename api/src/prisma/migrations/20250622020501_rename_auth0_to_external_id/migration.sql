/*
  Warnings:

  - You are about to drop the column `auth0Id` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Usuario_auth0Id_key";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "auth0Id",
ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_externalId_key" ON "Usuario"("externalId");
