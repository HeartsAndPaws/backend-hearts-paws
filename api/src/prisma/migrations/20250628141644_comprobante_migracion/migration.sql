/*
  Warnings:

  - A unique constraint covering the columns `[comprobante]` on the table `Donacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Donacion_comprobante_key" ON "Donacion"("comprobante");
