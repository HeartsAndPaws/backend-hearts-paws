/*
  Warnings:

  - You are about to drop the column `estadoAdopcion` on the `Caso` table. All the data in the column will be lost.
  - You are about to drop the column `estadoDonacion` on the `Caso` table. All the data in the column will be lost.
  - You are about to drop the column `metaDonacion` on the `Caso` table. All the data in the column will be lost.
  - Added the required column `titulo` to the `Caso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Caso" DROP COLUMN "estadoAdopcion",
DROP COLUMN "estadoDonacion",
DROP COLUMN "metaDonacion",
ADD COLUMN     "titulo" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CasoAdopcion" (
    "id" TEXT NOT NULL,
    "casoId" TEXT NOT NULL,
    "estado" "EstadoAdopcion" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "CasoAdopcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasoDonacion" (
    "id" TEXT NOT NULL,
    "casoId" TEXT NOT NULL,
    "estadoDonacion" DOUBLE PRECISION NOT NULL,
    "metaDonacion" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CasoDonacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CasoAdopcion_casoId_key" ON "CasoAdopcion"("casoId");

-- CreateIndex
CREATE UNIQUE INDEX "CasoDonacion_casoId_key" ON "CasoDonacion"("casoId");

-- AddForeignKey
ALTER TABLE "CasoAdopcion" ADD CONSTRAINT "CasoAdopcion_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "Caso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasoDonacion" ADD CONSTRAINT "CasoDonacion_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "Caso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
