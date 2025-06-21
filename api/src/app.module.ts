import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { OrganizacionesModule } from './organizaciones/organizaciones.module';
import { AuthModule } from './autenticacion/local/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MascotasModule } from './mascotas/mascotas.module';
import { EmailModule } from './shared/email/email-server.module';
import { CasosModule } from './casos/casos.module';
import { DyAModule } from './donacion-adopcion/dya.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    CloudinaryModule,
    UsuariosModule,
    OrganizacionesModule,
    AuthModule,
    PrismaModule,
    MascotasModule,
    EmailModule,
    CasosModule,
    DyAModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
