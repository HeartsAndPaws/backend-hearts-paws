import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseController } from './supabase.controller';
import { SupabaseService } from './supabase.service';
import { SupabaseStrategy } from './supabaseLogic/jwt.strategy';

@Module({
  imports: [PassportModule],
  controllers: [SupabaseController],
  providers: [SupabaseService, SupabaseStrategy ,PrismaService],
})
export class SupabaseModule {}
