/*
  Warnings:

  - You are about to drop the column `autorId` on the `Mensaje` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Mensaje" DROP CONSTRAINT "Mensaje_autorId_fkey";

-- AlterTable
ALTER TABLE "Mensaje" DROP COLUMN "autorId",
ADD COLUMN     "autorOrganizacionId" TEXT,
ADD COLUMN     "autorUsuarioId" TEXT;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_autorUsuarioId_fkey" FOREIGN KEY ("autorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_autorOrganizacionId_fkey" FOREIGN KEY ("autorOrganizacionId") REFERENCES "Organizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
