import { Module } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { OrganizacionesController } from './organizaciones.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { EmailService } from 'src/shared/email/email.service';
import { EmailModule } from 'src/shared/email/email.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h'},
      })
    }),
    PrismaModule, CloudinaryModule, PassportModule, EmailModule],
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService, JwtService],
})
export class OrganizacionesModule {}
