import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient, Rol, Plan, EstadoAdopcion, TipoCaso } from "@prisma/client";
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Hasheo de contraseñas
    const hashedPasswordUsuario = await bcrypt.hash('usuario123', 10);
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
    const hashedPasswordONG = await bcrypt.hash('ong123', 10);

    // === Crear tipos de mascota si no existen ===
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

    // === Crear usuarios si no existen ===
    const usuario1 = await prisma.usuario.upsert({
        where: { email: 'lucia@example.com' },
        update: {},
        create: {
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

    // Usuario adicional para variedad
    const usuario2 = await prisma.usuario.upsert({
        where: { email: 'carlos@example.com' },
        update: {},
        create: {
            nombre: 'Carlos Gómez',
            email: 'carlos@example.com',
            contrasena: await bcrypt.hash('carlos123', 10),
            telefono: '+5491166778899',
            direccion: 'Calle Flores 456',
            ciudad: 'Rosario',
            pais: 'Argentina',
            rol: Rol.USUARIO,
        },
    });

    const admin = await prisma.usuario.upsert({
        where: { email: 'admin@heartsandpaws.com' },
        update: {},
        create: {
            nombre: 'Admin Hearts',
            email: 'admin@heartsandpaws.com',
            contrasena: hashedPasswordAdmin,
            rol: Rol.ADMIN,
            ciudad: 'Ciudad Autónoma',
            pais: 'Argentina',
        },
    });

    // === Crear organizaciones si no existen ===
    const ong1 = await prisma.organizacion.upsert({
        where: { email: 'contacto@patitas.org' },
        update: {},
        create: {
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

    const ong2 = await prisma.organizacion.upsert({
        where: { email: 'info@huellas.org' },
        update: {},
        create: {
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

    // === Crear mascotas si no existen ===
    const existingMascota = await prisma.mascota.findFirst({
        where: { nombre: 'Luna' },
    });

    let mascota1;
    if (!existingMascota) {
        mascota1 = await prisma.mascota.create({
            data: {
                nombre: 'Luna',
                edad: 2,
                descripcion: 'Muy cariñosa, ideal para familias.',
                organizacionId: ong1.id,
                tipoId: tipoPerro.id,
            },
        });
    } else {
        mascota1 = existingMascota;
    }

    let mascota2 = await prisma.mascota.findFirst({
        where: {
            nombre: 'Michi',
            organizacionId: ong2.id,
        },
    });

    if (!mascota2) {
        mascota2 = await prisma.mascota.create({
            data: {
                nombre: 'Michi',
                edad: 1,
                descripcion: 'Tranquilo, le gusta dormir al sol.',
                organizacionId: ong2.id,
                tipoId: tipoGato.id,
            },
        });
    }

    // === Agregar imágenes si no existen ===
    const existingImages = await prisma.imagenMascota.findMany();
    if (!existingImages.length) {
        await prisma.imagenMascota.createMany({
            data: [
                { url: 'https://placedog.net/400/300', mascotaId: mascota1.id },
                { url: 'https://comunidad.retorn.com/wp-content/uploads/cache/2018/09/gatitos/1583254719.jpg', mascotaId: mascota2.id },
            ],
        });
    }

    // === Crear casos solo si no existen ===
    const existingCasoAdopcion = await prisma.caso.findFirst({
        where: { titulo: 'Adopta a Luna' },
    });

    let casoAdopcionLuna;
    if (!existingCasoAdopcion) {
        casoAdopcionLuna = await prisma.caso.create({
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
                estado: EstadoAdopcion.PENDIENTE,
            }
        });
    } else {
        casoAdopcionLuna = existingCasoAdopcion;
    }

    const existingCasoDonacion = await prisma.caso.findFirst({
        where: { titulo: 'Ayuda a Michi' },
    });

    let casoDonacionMichi;
    if (!existingCasoDonacion) {
        casoDonacionMichi = await prisma.caso.create({
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
    } else {
        casoDonacionMichi = existingCasoDonacion;
    }

    // Agrega caso de donación para Luna si no existe
    let casoDonacionLuna = await prisma.caso.findFirst({
        where: { titulo: 'Ayuda a Luna' },
    });

    if (!casoDonacionLuna) {
        casoDonacionLuna = await prisma.caso.create({
            data: {
                titulo: 'Ayuda a Luna',
                descripcion: 'Luna necesita ayuda médica.',
                tipo: TipoCaso.DONACION,
                mascotaId: mascota1.id,
                ongId: ong1.id,
            }
        });

        await prisma.casoDonacion.create({
            data: {
                casoId: casoDonacionLuna.id,
                metaDonacion: 80000,
                estadoDonacion: 12000,
            }
        });
    }

    // === DONACIONES DE PRUEBA (Stripe-like) ===
    const casoDonacionMichiObj = await prisma.casoDonacion.findFirst({
        where: { casoId: casoDonacionMichi.id }
    });
    const casoDonacionLunaObj = await prisma.casoDonacion.findFirst({
        where: { casoId: casoDonacionLuna.id }
    });

    // 1. Donación a Michi (ONG2) por usuario1
    if (casoDonacionMichiObj) {
        await prisma.donacion.upsert({
            where: { comprobante: 'cs_test_1234567890A' },
            update: {},
            create: {
                usuarioId: usuario1.id,
                organizacionId: ong2.id,
                mascotaId: mascota2.id,
                monto: 10000,
                comprobante: 'cs_test_1234567890A',
                estadoPago: 'paid',
                stripeSessionId: 'cs_test_1234567890A',
                referenciaPago: 'pi_test_abc123',
                casoDonacionId: casoDonacionMichiObj.id,
            }
        });
        // 2. Donación a Michi (ONG2) por usuario2
        await prisma.donacion.upsert({
            where: { comprobante: 'cs_test_1234567890B' },
            update: {},
            create: {
                usuarioId: usuario2.id,
                organizacionId: ong2.id,
                mascotaId: mascota2.id,
                monto: 20000,
                comprobante: 'cs_test_1234567890B',
                estadoPago: 'paid',
                stripeSessionId: 'cs_test_1234567890B',
                referenciaPago: 'pi_test_def456',
                casoDonacionId: casoDonacionMichiObj.id,
            }
        });
    }

    // 3. Donación a Luna (ONG1) por usuario2
    if (casoDonacionLunaObj) {
        await prisma.donacion.upsert({
            where: { comprobante: 'cs_test_1234567890C' },
            update: {},
            create: {
                usuarioId: usuario2.id,
                organizacionId: ong1.id,
                mascotaId: mascota1.id,
                monto: 6000,
                comprobante: 'cs_test_1234567890C',
                estadoPago: 'paid',
                stripeSessionId: 'cs_test_1234567890C',
                referenciaPago: 'pi_test_ghi789',
                casoDonacionId: casoDonacionLunaObj.id,
            }
        });
    }

    console.log('Seed ejecutado sin borrar datos previos');
}

main()
    .catch((e) => {
        console.error('Error en el seed:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
