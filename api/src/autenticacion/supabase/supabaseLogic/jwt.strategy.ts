import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { createClient } from '@supabase/supabase-js'



@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private supabase;

  constructor() {
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

    return {
      sub,
      email,
      name: user_metadata?.full_name || null,
      picture: user_metadata?.avatar_url || null,
    }
  }
}
