/*
  Warnings:

  - Made the column `telefono` on table `Usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `direccion` on table `Usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ciudad` on table `Usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pais` on table `Usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contrasena` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "dni" TEXT NOT NULL DEFAULT 'Incompleto',
ADD COLUMN     "estadoCivil" TEXT NOT NULL DEFAULT 'Incompleto',
ADD COLUMN     "ocupacion" TEXT NOT NULL DEFAULT 'Incompleto',
ALTER COLUMN "telefono" SET NOT NULL,
ALTER COLUMN "direccion" SET NOT NULL,
ALTER COLUMN "ciudad" SET NOT NULL,
ALTER COLUMN "pais" SET NOT NULL,
ALTER COLUMN "contrasena" SET NOT NULL;

-- CreateTable
CREATE TABLE "SolicitudDeAdopcion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "casoAdopcionId" TEXT NOT NULL,
    "estado" "EstadoAdopcion" NOT NULL DEFAULT 'PENDIENTE',
    "tipoVivienda" TEXT NOT NULL,
    "conQuienVives" TEXT NOT NULL,
    "hijos" TEXT,
    "otros" TEXT,
    "hayOtrasMascotas" TEXT NOT NULL,
    "descripcionOtrasMascotas" TEXT,
    "cubrirGastos" TEXT NOT NULL,
    "darAlimentoCuidados" TEXT NOT NULL,
    "darAmorTiempoEj" TEXT NOT NULL,
    "devolucionDeMascota" TEXT NOT NULL,
    "siNoPodesCuidarla" TEXT NOT NULL,
    "declaracionFinal" TEXT NOT NULL,

    CONSTRAINT "SolicitudDeAdopcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudDeAdopcion_casoAdopcionId_key" ON "SolicitudDeAdopcion"("casoAdopcionId");

-- AddForeignKey
ALTER TABLE "SolicitudDeAdopcion" ADD CONSTRAINT "SolicitudDeAdopcion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudDeAdopcion" ADD CONSTRAINT "SolicitudDeAdopcion_casoAdopcionId_fkey" FOREIGN KEY ("casoAdopcionId") REFERENCES "CasoAdopcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
