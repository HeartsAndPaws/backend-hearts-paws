/*
  Warnings:

  - You are about to drop the column `password` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `contraseña` to the `Organizacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contraseña` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organizacion" ADD COLUMN     "contraseña" TEXT NOT NULL,
ADD COLUMN     "imagenPerfil" TEXT;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "password",
ADD COLUMN     "contraseña" TEXT NOT NULL,
ADD COLUMN     "imagenPerfil" TEXT;

-- CreateTable
CREATE TABLE "imagenMascota" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mascotaId" TEXT NOT NULL,
    "subida_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenMascota_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "imagenMascota" ADD CONSTRAINT "imagenMascota_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
