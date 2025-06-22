import { Injectable, UnauthorizedException } from '@nestjs/common';
import { use } from 'passport';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class SupabaseService {
    constructor(private readonly prisma: PrismaService){}

    async registrarOrSync(supabaseUser: {
        sub: string;
        email: string;
        name: string;
        picture?: string;
    }){
        const { sub: externalId, email, name , picture } = supabaseUser;

        if (!email || !externalId) {
            throw new UnauthorizedException('Token inválido: flatan campos obligatorios');
        }

        let user = await this.prisma.usuario.findUnique({
            where: { email },
        });

        if (user && !user.externalId) {
            throw new UnauthorizedException('Este correo ya existe como usuario local');
        }

        if (!user) {
            const nombreSeguro = name?.trim() || 'Usuario Externo';

            user = await this.prisma.usuario.create({
                data: {
                    email,
                    nombre: nombreSeguro,
                    imagenPerfil: picture || null,
                    rol: 'USUARIO',
                    contrasena: null,
                    externalId,
                },
            });
        }
        return user;
    }
}
