import { Module } from '@nestjs/common';
import { SolicitudAdoptarService } from './solicitud-adoptar.service';
import { SolicitudAdoptarController } from './solicitud-adoptar.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from 'src/shared/email/email-server.service';
import { EmailModule } from 'src/shared/email/email-server.module';

@Module({
  imports: [EmailModule],
  controllers: [SolicitudAdoptarController],
  providers: [SolicitudAdoptarService, PrismaService],
})
export class SolicitudAdoptarModule {}
