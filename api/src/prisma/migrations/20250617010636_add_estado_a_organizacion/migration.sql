-- CreateEnum
CREATE TYPE "EstadoOrganizacion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- AlterTable
ALTER TABLE "Organizacion" ADD COLUMN     "estado" "EstadoOrganizacion" NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "contrasena" DROP NOT NULL;
