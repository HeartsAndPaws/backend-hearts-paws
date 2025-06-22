-- CreateEnum
CREATE TYPE "EstadoCasoDonacion" AS ENUM ('ACTIVO', 'COMPLETADO');

-- AlterTable
ALTER TABLE "CasoDonacion" ADD COLUMN     "estado" "EstadoCasoDonacion" NOT NULL DEFAULT 'ACTIVO';
