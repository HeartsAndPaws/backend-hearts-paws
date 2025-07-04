-- CreateTable
CREATE TABLE "ImagenesDeLaPublicacion" (
    "id" TEXT NOT NULL,
    "subidas_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idCasoPadre" TEXT NOT NULL,

    CONSTRAINT "ImagenesDeLaPublicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imagen" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sensible" BOOLEAN NOT NULL DEFAULT false,
    "imagenesDeLaPublicacionId" TEXT NOT NULL,

    CONSTRAINT "Imagen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImagenesDeLaPublicacion_idCasoPadre_key" ON "ImagenesDeLaPublicacion"("idCasoPadre");

-- AddForeignKey
ALTER TABLE "ImagenesDeLaPublicacion" ADD CONSTRAINT "ImagenesDeLaPublicacion_idCasoPadre_fkey" FOREIGN KEY ("idCasoPadre") REFERENCES "Caso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imagen" ADD CONSTRAINT "Imagen_imagenesDeLaPublicacionId_fkey" FOREIGN KEY ("imagenesDeLaPublicacionId") REFERENCES "ImagenesDeLaPublicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
