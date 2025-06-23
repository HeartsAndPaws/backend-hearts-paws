import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { createClient } from '@supabase/supabase-js'
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private supabase;

  constructor( private readonly prisma: PrismaService) {
    super();

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('❌ Variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están definidas')
    }

    this.supabase = createClient(url, key);
  }

  async validate(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw new UnauthorizedException('Token de Supabse inválido');
    }

    const user = data.user;
    const sub = user?.id;
    const email = user?.email;
    const user_metadata = user?.user_metadata || {};

    if (!email || !sub) {
      throw new UnauthorizedException('Token inválido: faltan campos obligatorios');
    }

    try {
      let usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });


    if (usuario && !usuario.externalId) {
      throw new UnauthorizedException('Este correo ya existe como usuario local')
    }

    if (!usuario) {
      const nombreSeguro = user_metadata?.full_name?.trim() || 'Usuario externo';
      usuario = await this.prisma.usuario.create({
        data: {
          email,
          nombre: nombreSeguro,
          imagenPerfil: user_metadata?.avatar_url || null,
          rol: 'USUARIO',
          contrasena: null,
          externalId: sub,
        },
      });
    }

    if (usuario.externalId !== sub) {
      usuario = await this.prisma.usuario.update({
        where: { email},
        data: { externalId: sub },
      });
    }

    return {
      sub,
      email: usuario.email,
      rol: usuario.rol,
      name: usuario.nombre,
      picture: usuario.imagenPerfil,
      external: true
    };
    } catch (error) {
      throw new UnauthorizedException('Error al validar usuario externo');
    }
  } 
}
