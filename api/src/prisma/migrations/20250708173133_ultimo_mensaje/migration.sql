/*
  Warnings:

  - A unique constraint covering the columns `[ultimoMensajeId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "ultimoMensajeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_ultimoMensajeId_key" ON "Chat"("ultimoMensajeId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_ultimoMensajeId_fkey" FOREIGN KEY ("ultimoMensajeId") REFERENCES "Mensaje"("id") ON DELETE SET NULL ON UPDATE CASCADE;
