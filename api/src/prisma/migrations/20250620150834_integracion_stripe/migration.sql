-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'COMPLETADO', 'FALLIDO');

-- DropForeignKey
ALTER TABLE "Donacion" DROP CONSTRAINT "Donacion_mascotaId_fkey";

-- AlterTable
ALTER TABLE "Donacion" ADD COLUMN     "casoDonacionId" TEXT,
ADD COLUMN     "estadoPago" TEXT,
ADD COLUMN     "referenciaPago" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ALTER COLUMN "mascotaId" DROP NOT NULL,
ALTER COLUMN "comprobante" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "Mascota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_casoDonacionId_fkey" FOREIGN KEY ("casoDonacionId") REFERENCES "CasoDonacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
