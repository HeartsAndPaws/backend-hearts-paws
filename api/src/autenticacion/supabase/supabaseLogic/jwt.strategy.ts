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

    const { id: sub, email, user_metadata } = data.user;

    if (!email || !sub) {
      throw new UnauthorizedException('El token no contiene email o ID');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { externalId: sub},
      select: { id: true, rol: true},
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario externo no registrado en el sistema local');
    }

    return {
      id: usuario.id,
      email,
      rol: usuario.rol,
      name: user_metadata?.full_name || null,
      picture: user_metadata?.avatar_url || null,
      external: true,
    }
  }
}
