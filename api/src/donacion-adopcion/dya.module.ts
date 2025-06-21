import { Module } from '@nestjs/common';
import { CasosController } from './dya.controller';
import { ServicioDyA } from './dya.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CasosController],
  providers: [
    ServicioDyA,
    PrismaService,
  ],
})
export class DyAModule {}
