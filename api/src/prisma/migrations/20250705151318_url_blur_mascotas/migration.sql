-- AlterTable
ALTER TABLE "imagenMascota" ADD COLUMN     "esSensible" BOOLEAN DEFAULT false,
ADD COLUMN     "urlBlur" TEXT,
ADD COLUMN     "violenciaScore" DOUBLE PRECISION;
