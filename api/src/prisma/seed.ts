import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient, Rol, Plan, EstadoAdopcion, TipoCaso } from "@prisma/client";
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Limpieza (en orden de dependencias para evitar errores por FK)
    await prisma.imagenMascota.deleteMany();
    await prisma.casoAdopcion.deleteMany();
    await prisma.casoDonacion.deleteMany();
    await prisma.caso.deleteMany();
    await prisma.mascota.deleteMany();
    await prisma.tiposMascota.deleteMany();
    await prisma.organizacion.deleteMany();
    await prisma.usuario.deleteMany();

    // Hasheo de contraseñas
    const hashedPasswordUsuario = await bcrypt.hash('usuario123', 10);
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
    const hashedPasswordONG = await bcrypt.hash('ong123', 10);

    // Crear tipos de mascota
    const tipoPerro = await prisma.tiposMascota.create({ data: { nombre: 'Perro' } });
    const tipoGato = await prisma.tiposMascota.create({ data: { nombre: 'Gato' } });

    // Crear usuarios
    const usuario1 = await prisma.usuario.create({
        data: {
            nombre: 'Lucía Fernández',
            email: 'lucia@example.com',
            contrasena: hashedPasswordUsuario,
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
            contrasena: hashedPasswordAdmin,
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
            contrasena: hashedPasswordONG,
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
            contrasena: hashedPasswordONG,
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



    // Agregar imágenes de prueba
    await prisma.imagenMascota.createMany({
        data: [
            { url: 'https://placedog.net/400/300', mascotaId: mascota1.id },
            { url: 'https://comunidad.retorn.com/wp-content/uploads/cache/2018/09/gatitos/1583254719.jpg', mascotaId: mascota2.id },
        ],
    });

    // === Crear casos ===

    // Caso de adopción para Luna (mascota1, ONG1)
    const casoAdopcionLuna = await prisma.caso.create({
        data: {
            titulo: 'Adopta a Luna',
            descripcion: 'Luna busca una familia amorosa.',
            tipo: TipoCaso.ADOPCION,
            mascotaId: mascota1.id,
            ongId: ong1.id,
        }
    });

    await prisma.casoAdopcion.create({
        data: {
            casoId: casoAdopcionLuna.id,
            estado: EstadoAdopcion.PENDIENTE, // Enum del schema Prisma
        }
    });

    // Caso de donación para Michi (mascota2, ONG2)
    const casoDonacionMichi = await prisma.caso.create({
        data: {
            titulo: 'Ayuda a Michi',
            descripcion: 'Recaudación para operación de Michi.',
            tipo: TipoCaso.DONACION,
            mascotaId: mascota2.id,
            ongId: ong2.id,
        }
    });

    await prisma.casoDonacion.create({
        data: {
            casoId: casoDonacionMichi.id,
            metaDonacion: 250000,
            estadoDonacion: 35000,
        }
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
