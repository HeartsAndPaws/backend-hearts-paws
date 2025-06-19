/*
  Warnings:

  - You are about to drop the column `raza` on the `Mascota` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Mascota` table. All the data in the column will be lost.
  - Added the required column `tipoId` to the `Mascota` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoCaso" AS ENUM ('ADOPCION', 'DONACION');

-- AlterTable
ALTER TABLE "Mascota" DROP COLUMN "raza",
DROP COLUMN "tipo",
ADD COLUMN     "tipoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TiposMascota" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TiposMascota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caso" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" "TipoCaso" NOT NULL,
    "mascotaId" TEXT NOT NULL,
    "estadoAdopcion" BOOLEAN NOT NULL DEFAULT false,
    "estadoDonacion" DOUBLE PRECISION,
    "metaDonacion" DOUBLE PRECISION,
    "ongId" TEXT,

    CONSTRAINT "Caso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TiposMascota_nombre_key" ON "TiposMascota"("nombre");

-- AddForeignKey
ALTER TABLE "Mascota" ADD CONSTRAINT "Mascota_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "TiposMascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caso" ADD CONSTRAINT "Caso_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caso" ADD CONSTRAINT "Caso_ongId_fkey" FOREIGN KEY ("ongId") REFERENCES "Organizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
