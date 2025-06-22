import { Controller, Get, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  saludar() {
    return { mensaje: 'Servidor funcionando' };
  }

  @Get('success')
  async success(@Query('session_id') sessionId: string, @Res() res: Response){
    return res.send(`´
      <h2>✅ ¡Pago exitoso!</h2>
      <p>Session ID: ${sessionId}</p>
      <a href="/">Volver al inicio</a>
      `);
  }

  @Get('cancel')
  async cancel(@Res() res: Response){
    return res.send(`<h2>❌ Pago cancelado</h2>`)
  }
}
