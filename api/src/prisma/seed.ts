import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient, Rol, Plan } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Limpieza (en orden de dependencias para evitar errores por FK)
    await prisma.imagenMascota.deleteMany();
    await prisma.mascota.deleteMany();
    await prisma.tiposMascota.deleteMany();
    await prisma.organizacion.deleteMany();
    await prisma.usuario.deleteMany();

    // Crear tipos de mascota
    const tipoPerro = await prisma.tiposMascota.create({ data: { nombre: 'Perro' } });
    const tipoGato = await prisma.tiposMascota.create({ data: { nombre: 'Gato' } });
    const tipoConejo = await prisma.tiposMascota.create({ data: { nombre: 'Conejo' } });

    // Crear usuarios
    const usuario1 = await prisma.usuario.create({
        data: {
            nombre: 'Lucía Fernández',
            email: 'lucia@example.com',
            contrasena: 'hashed-password1',
            telefono: '+5491122334455',
            direccion: 'Av. Siempre Viva 123',
            ciudad: 'Buenos Aires',
            pais: 'Argentina',
            rol: Rol.USUARIO,
        },
    });

    const admin = await prisma.usuario.create({
        data: {
            nombre: 'Admin Hearts',
            email: 'admin@heartsandpaws.com',
            contrasena: 'hashed-admin-contraseña',
            rol: Rol.ADMIN,
            ciudad: 'Ciudad Autónoma',
            pais: 'Argentina',
        },
    });

    // Crear organizaciones
    const ong1 = await prisma.organizacion.create({
        data: {
            nombre: 'Patitas Callejeras',
            email: 'contacto@patitas.org',
            contrasena: 'hashed-ong-contraseña',
            descripcion: 'Refugio y rehabilitación de animales en situación de calle.',
            telefono: '+5491144455566',
            direccion: 'Calle Rescate Animal 456',
            ciudad: 'Córdoba',
            pais: 'Argentina',
            plan: Plan.GRATUITO,
        },
    });

    const ong2 = await prisma.organizacion.create({
        data: {
            nombre: 'Huellas de Amor',
            email: 'info@huellas.org',
            contrasena: 'hashed-ong-contraseña',
            descripcion: 'Adopciones responsables con seguimiento post-adopción.',
            direccion: 'Av. Adopción 789',
            ciudad: 'Mendoza',
            pais: 'Argentina',
            telefono: '+5491177788899',
            plan: Plan.PREMIUM,
        },
    });

    // Crear mascotas
    const mascota1 = await prisma.mascota.create({
        data: {
            nombre: 'Luna',
            edad: 2,
            descripcion: 'Muy cariñosa, ideal para familias.',
            organizacionId: ong1.id,
            tipoId: tipoPerro.id,
        },
    });

    const mascota2 = await prisma.mascota.create({
        data: {
            nombre: 'Michi',
            edad: 1,
            descripcion: 'Tranquilo, le gusta dormir al sol.',
            organizacionId: ong2.id,
            tipoId: tipoGato.id,
        },
    });

    const mascota3 = await prisma.mascota.create({
        data: {
            nombre: 'Saltitos',
            edad: 3,
            descripcion: 'Conejo juguetón, le encanta saltar y las zanahorias.',
            organizacionId: ong1.id,
            tipoId: tipoConejo.id,
        },
    });

    // Agregar imágenes de prueba
    await prisma.imagenMascota.createMany({
        data: [
            { url: 'https://placedog.net/400/300', mascotaId: mascota1.id },
            { url: 'https://placekitten.com/300/300', mascotaId: mascota2.id },
            { url: 'https://images.pexels.com/photos/rabbit.jpg', mascotaId: mascota3.id },
            { url: 'https://images.pexels.com/photos/rabbit2.jpg', mascotaId: mascota3.id },
        ],
    });

    console.log('Seed ejecutado correctamente');
};

main()
    .catch((e) => {
        console.error('Error en el seed:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
