import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tipoPerro = await prisma.tiposMascota.upsert({
    where: { nombre: 'Perro' },
    update: {},
    create: { nombre: 'Perro' },
  });

  const tipoGato = await prisma.tiposMascota.upsert({
    where: { nombre: 'Gato' },
    update: {},
    create: { nombre: 'Gato' },
  });

  console.log('🐾 Tipos de mascota cargados correctamente:', [tipoPerro.nombre, tipoGato.nombre]);
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seeder:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });