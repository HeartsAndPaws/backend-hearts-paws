/*
  Warnings:

  - Changed the type of `tipoVivienda` on the `SolicitudDeAdopcion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `hayOtrasMascotas` on the `SolicitudDeAdopcion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable: cambio de tipo enum a texto SIN perder datos
ALTER TABLE "SolicitudDeAdopcion"
  ALTER COLUMN "tipoVivienda" TYPE TEXT USING "tipoVivienda"::text,
  ALTER COLUMN "hayOtrasMascotas" TYPE TEXT USING "hayOtrasMascotas"::text;

-- Drop los enums si ya no se usan en ningún otro lado
DROP TYPE IF EXISTS "OtrasMascotas";
DROP TYPE IF EXISTS "TipoVivienda";
