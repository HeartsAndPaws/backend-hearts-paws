import { Module } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { OrganizacionesController } from './organizaciones.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from 'src/shared/email/email-server.module';

@Module({
  imports: [
    JwtModule,
    PrismaModule, 
    CloudinaryModule, 
    PassportModule, 
    EmailModule],
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService, JwtService],
})
export class OrganizacionesModule {}
