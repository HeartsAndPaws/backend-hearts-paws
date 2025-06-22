import { Controller, Get, UseGuards, Post, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SupabaseService } from './supabase.service';
import { SupabaseGuard } from './supabaseLogic/jwt-supabase.guard';

@Controller('auth')
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('protected')
  getProtected(@Req() req: Request) {
    return {
      message: 'Acceso concedido al backend protegido',
      user: req.user,
    };
  }

  @UseGuards(AuthGuard('supabase'))
  @Post('supabase/sync')
  async syncUser(@Req() req) {
    return this.supabaseService.registrarOrSync(req.user);
  }
}
