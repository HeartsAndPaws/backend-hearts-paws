/*
  Warnings:

  - Changed the type of `tipoVivienda` on the `SolicitudDeAdopcion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `hayOtrasMascotas` on the `SolicitudDeAdopcion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OtrasMascotas" AS ENUM ('SI', 'NO');

-- CreateEnum
CREATE TYPE "TipoVivienda" AS ENUM ('CASA', 'DEPARTAMENTO');

-- AlterTable
ALTER TABLE "SolicitudDeAdopcion"
ALTER COLUMN "tipoVivienda" TYPE "TipoVivienda" USING "tipoVivienda"::"TipoVivienda",
ALTER COLUMN "hayOtrasMascotas" TYPE "OtrasMascotas" USING "hayOtrasMascotas"::"OtrasMascotas";

