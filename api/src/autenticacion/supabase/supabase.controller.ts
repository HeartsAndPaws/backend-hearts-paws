import { Controller, Get, UseGuards, Post, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SupabaseService } from './supabase.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('protected')
  @ApiOperation({ summary: 'Endpoint de prueba protegido por autenticación' })
  @ApiResponse({
    status: 200,
    description: 'Acceso concedido a ruta protegida',
    schema: {
      example: {
        message: 'Acceso concedido al backend protegido',
        user: {
          id: 'd471a7f7-91be-4e7e-b20b-25e3eb370cee',
          email: 'usuario@ejemplo.com',
          rol: 'USUARIO',
          name: 'Usuario Ejemplo',
          picture: 'https://i.imgur.com/perfil.png',
          external: true
        }
      }
    }
  })
  getProtected(@Req() req: Request) {
    return {
      message: 'Acceso concedido al backend protegido',
      user: req.user,
    };
  }

  @UseGuards(AuthGuard('supabase'))
  @Post('supabase/sync')
  @ApiOperation({ summary: 'Sincroniza o registra un usuario desde Supabase' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Usuario sincronizado o registrado exitosamente',
    schema: {
      example: {
        id: 'd471a7f7-91be-4e7e-b20b-25e3eb370cee',
        email: 'usuario@ejemplo.com',
        rol: 'USUARIO',
        name: 'Usuario Externo',
        picture: 'https://i.imgur.com/perfil.png',
        external: true
      }
    }
  })
  async syncUser(@Req() req) {
    return req.user;
  }
}
