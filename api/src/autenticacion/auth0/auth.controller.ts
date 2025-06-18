import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('autDeTerceros')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Get('protected')
  getProtected(@Request() req) {
    return { 
      message: 'Acceso concedido al backend protegido', 
      user: req.user };
  }

}
