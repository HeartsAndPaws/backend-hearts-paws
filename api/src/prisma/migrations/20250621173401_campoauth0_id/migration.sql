/*
  Warnings:

  - A unique constraint covering the columns `[auth0Id]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "auth0Id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_auth0Id_key" ON "Usuario"("auth0Id");
