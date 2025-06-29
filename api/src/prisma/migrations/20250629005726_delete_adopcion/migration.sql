/*
  Warnings:

  - You are about to drop the column `dni` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `edad` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `estadoCivil` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `ocupacion` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the `Adopcion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Adopcion" DROP CONSTRAINT "Adopcion_mascotaId_fkey";

-- DropForeignKey
ALTER TABLE "Adopcion" DROP CONSTRAINT "Adopcion_organizacionId_fkey";

-- DropForeignKey
ALTER TABLE "Adopcion" DROP CONSTRAINT "Adopcion_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "dni",
DROP COLUMN "edad",
DROP COLUMN "estadoCivil",
DROP COLUMN "ocupacion";

-- DropTable
DROP TABLE "Adopcion";
