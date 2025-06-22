/*
  Warnings:

  - You are about to drop the column `archivoVerificacion` on the `Organizacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organizacion" DROP COLUMN "archivoVerificacion",
ADD COLUMN     "archivoVerificacionUrl" TEXT;
