import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServicioAuth } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../strategias/jwt.strategy';
import { JwtAuthGuard } from '../auth0/auth0Logic/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    CloudinaryModule
  ],
  providers: [ServicioAuth, JwtStrategy, JwtAuthGuard, RolesGuard],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule, JwtStrategy, JwtAuthGuard, RolesGuard]
})
export class AuthModule {}
