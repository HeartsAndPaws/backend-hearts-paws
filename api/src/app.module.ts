import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config'
import { UsuariosModule } from './usuarios/usuarios.module';
import { OrganizacionesModule } from './organizaciones/organizaciones.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module'


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    CloudinaryModule,
    UsuariosModule,
    OrganizacionesModule, AuthModule, PrismaModule],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
