/*
  Warnings:

  - The `estado` column on the `CasoAdopcion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `hayOtrasMascotas` on table `SolicitudDeAdopcion` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "EstadoCasoAdopcion" AS ENUM ('PENDIENTE', 'ACEPTADA');

-- AlterTable
ALTER TABLE "CasoAdopcion" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoCasoAdopcion" NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "SolicitudDeAdopcion" ALTER COLUMN "hayOtrasMascotas" SET NOT NULL;
