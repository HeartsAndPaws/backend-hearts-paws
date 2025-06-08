import { PrismaClient, Rol, Plan } from "../generated/prisma";

const prisma = new PrismaClient();

async function main(){
    // crear usuarios
    const usuario1 = await prisma.usuario.create({
        data: {
            nombre: 'Lucía Fernández',
            email: 'lucia@example.com',
            password: 'hashed-password1', // Asegúrate de usar un hash real en producción
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
            password: 'hashed-admin-password',
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
            tipo: 'Perro',
            raza: 'Labrador',
            descripcion: 'Muy cariñosa, ideal para familias.',
            estadoAdopcion: false,
            estadoDonacion: true,
            organizacionId: ong1.id,
        },
    });

    const mascota2 = await prisma.mascota.create({
        data: {
            nombre: 'Michi',
            edad: 1,
            tipo: 'Gato',
            raza: 'Criollo',
            descripcion: 'Tranquilo, le gusta dormir al sol.',
            estadoAdopcion: true,
            estadoDonacion: false,
            organizacionId: ong2.id,
        },
    });

    console.log('Seed completo correctamente');
};

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Error en el seed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });