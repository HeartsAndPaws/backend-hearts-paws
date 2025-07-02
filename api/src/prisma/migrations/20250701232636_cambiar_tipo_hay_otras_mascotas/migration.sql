/*
  Warnings:

  - Changed the type of `hayOtrasMascotas` on the `SolicitudDeAdopcion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoVivienda" AS ENUM ('casaConPatio', 'casaSinPatio', 'departamento');

-- AlterTable
ALTER TABLE "SolicitudDeAdopcion"
  ALTER COLUMN "hayOtrasMascotas"
  TYPE INTEGER
  USING "hayOtrasMascotas"::INTEGER;
