import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class SupabaseService {
    constructor(private readonly prisma: PrismaService){}

    async registrarOrSync(supabaseUser: {
    sub: string;
    email: string;
    name: string;
    picture?: string;
}) {
    const { sub: externalId, email, name, picture } = supabaseUser;

    if (!email || !externalId) {
        throw new UnauthorizedException('Token inválido: faltan campos obligatorios');
    }

    let usuario = await this.prisma.usuario.findUnique({ where: { email } });

    if (usuario && !usuario.externalId) {
        throw new UnauthorizedException('Este correo ya existe como usuario local');
    }

    if (!usuario) {
        usuario = await this.prisma.usuario.create({
            data: {
                email,
                nombre: name?.trim() || 'Usuario Externo',
                imagenPerfil: picture || null,
                rol: 'USUARIO',
                contrasena: null,
                externalId,
            },
        });
    }

    if (usuario.externalId !== externalId) {
        usuario = await this.prisma.usuario.update({
            where: { email },
            data: { externalId },
        });
    }

    return {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        tipo: 'USUARIO',
        name: usuario.nombre,
        picture: usuario.imagenPerfil,
        external: true,
    };
}
}
