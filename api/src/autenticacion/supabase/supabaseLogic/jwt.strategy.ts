import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { createClient } from '@supabase/supabase-js'
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseService } from '../supabase.service';


@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private supabase;

  constructor( 
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {
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
<<<<<<< HEAD
    const name = user.user_metadata?.full_name || 'Usuario Externo';
    const picture = user.user_metadata?.avatar_url || null;
=======
    const picture = user.user_metadata?.avatar_url || null;
    const name = user.user_metadata?.full_name?.trim();
>>>>>>> origin/main

    const usuario = await this.supabaseService.registrarOrSync({
      sub,
      email,
<<<<<<< HEAD
      name,
      picture,
=======
      picture,
      name,
>>>>>>> origin/main
    });


    return {
      id: usuario.id,
      email: usuario.email,
      tipo: 'USUARIO',
      rol: usuario.rol,
<<<<<<< HEAD
=======
      name: usuario.name,
>>>>>>> origin/main
      picture,
      external: true,
    }
  } 
}
