/*
  Warnings:

  - You are about to drop the column `conQuienVives` on the `SolicitudDeAdopcion` table. All the data in the column will be lost.
  - You are about to drop the column `otros` on the `SolicitudDeAdopcion` table. All the data in the column will be lost.
  - Added the required column `integrantesFlia` to the `SolicitudDeAdopcion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hijos` to the `SolicitudDeAdopcion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SolicitudDeAdopcion" DROP COLUMN "conQuienVives",
DROP COLUMN "otros",
ADD COLUMN     "integrantesFlia" INTEGER NOT NULL,
DROP COLUMN "hijos",
ADD COLUMN     "hijos" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "edad" INTEGER,
ALTER COLUMN "dni" DROP NOT NULL,
ALTER COLUMN "dni" DROP DEFAULT,
ALTER COLUMN "estadoCivil" DROP DEFAULT,
ALTER COLUMN "ocupacion" DROP DEFAULT;
