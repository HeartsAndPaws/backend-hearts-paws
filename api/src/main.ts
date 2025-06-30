import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NuevoUsuarioDto } from './autenticacion/dtos/NuevoUsuario.dto';
import { NuevaOrganizacionDto } from './autenticacion/dtos/NuevaOrganizacion';
import { CustomSocketIoAdapter } from './chat/socket-io.adapter';
import * as bodyParser from 'body-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Adaptador de WebSocket (Chat)
  app.useWebSocketAdapter(new CustomSocketIoAdapter(app));

  const configService = app.get(ConfigService);

  const rawCorsOrigins = configService.get<string>('CORS_ORIGINS') || '';
  const corsOrigins = rawCorsOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  // Middleware especial para Stripe Webhook (RAW BODY)
  app.use((req, res, next) => {
    if (req.originalUrl === '/stripe/webhook') {
      bodyParser.raw({ type: 'application/json'})(req, res, next);
    }else{
      bodyParser.json()(req, res, next);
    }
  });

  // Midleware general
  app.use(cookieParser());

  // Pipes globales de validación
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback( new Error(`Origen no permitido por CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  })


  // Swagger
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

  // Iniciar servidor
  await app.listen(configService.get<number>('PORT') ?? 3002);
  console.log(`Servidor prendido en el puerto ${configService.get<number>('PORT')}`);
}
bootstrap();
