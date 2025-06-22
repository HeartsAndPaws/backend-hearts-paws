/*
  Warnings:

  - Made the column `mascotaId` on table `Donacion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `comprobante` on table `Donacion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Donacion" DROP CONSTRAINT "Donacion_mascotaId_fkey";

-- AlterTable
ALTER TABLE "Donacion" ALTER COLUMN "mascotaId" SET NOT NULL,
ALTER COLUMN "comprobante" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
