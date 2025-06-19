/*
  Warnings:

  - You are about to drop the column `estadoAdopcion` on the `Mascota` table. All the data in the column will be lost.
  - You are about to drop the column `estadoDonacion` on the `Mascota` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mascota" DROP COLUMN "estadoAdopcion",
DROP COLUMN "estadoDonacion";
