-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('USUARIO', 'ADMIN', 'ORGANIZACION');

-- CreateEnum
CREATE TYPE "EstadoAdopcion" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('GRATUITO', 'PREMIUM');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "pais" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'USUARIO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "descripcion" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "pais" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'GRATUITO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mascota" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "raza" TEXT NOT NULL,
    "descripcion" TEXT,
    "estadoAdopcion" BOOLEAN NOT NULL DEFAULT false,
    "estadoDonacion" BOOLEAN NOT NULL DEFAULT false,
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizacionId" TEXT NOT NULL,

    CONSTRAINT "Mascota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "mascotaId" TEXT,
    "organizacionId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "comprobante" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adopcion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "mascotaId" TEXT NOT NULL,
    "estado" "EstadoAdopcion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaConfirmacion" TIMESTAMP(3),
    "organizacionId" TEXT NOT NULL,

    CONSTRAINT "Adopcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "enviado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organizacion_email_key" ON "Organizacion"("email");

-- AddForeignKey
ALTER TABLE "Mascota" ADD CONSTRAINT "Mascota_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "Mascota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adopcion" ADD CONSTRAINT "Adopcion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adopcion" ADD CONSTRAINT "Adopcion_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adopcion" ADD CONSTRAINT "Adopcion_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
