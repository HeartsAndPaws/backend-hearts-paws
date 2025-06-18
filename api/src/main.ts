import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NuevoUsuarioDto } from './autenticacion/dtos/NuevoUsuario.dto';
import { NuevaOrganizacionDto } from './autenticacion/dtos/NuevaOrganizacion';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || [];

  const config = new DocumentBuilder()
  .setTitle('Hearts&Paws API')
  .setDescription(
    `Hearts&Paws conecta organizaciones de protección animal con personas interesadas en adoptar o ayudar a animales. 
    Usa esta API para acceder a funcionalidades como registro de usuarios, adopciones, donaciones y más.
    Para acceder a rutas protegidas, debes autenticarte usando un token JWT.`
  )
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Ingrese el token JWT en el campo',
      in: 'header'
    },
    'jwt-auth', // nombre para marcar rutas protegidas.
  )
  .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [NuevoUsuarioDto, NuevaOrganizacionDto],
  });
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  await app.listen(configService.get<number>('PORT') ?? 3001);
  console.log(`Servidor prendido en el puerto ${configService.get<number>('PORT')}`);
}
bootstrap();
