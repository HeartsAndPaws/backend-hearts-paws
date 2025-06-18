import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServicioAut } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../strategias/jwt.strategy';
import { RolesGuard } from '../guards/roles.guard';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { JwtAutCookiesGuardia } from '../guards/jwtAut.guardia';

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
  providers: [ServicioAut, JwtStrategy, JwtAutCookiesGuardia, RolesGuard, JwtAutCookiesGuardia],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule, JwtStrategy,JwtAutCookiesGuardia , RolesGuard, JwtAutCookiesGuardia]
})
export class AuthModule {}
