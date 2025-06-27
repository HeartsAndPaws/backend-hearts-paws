import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtLocalStrategy extends PassportStrategy(Strategy, 'jwt-local') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.authToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: any) {

    if (!payload || !payload.sub || !payload.rol) {
      throw new UnauthorizedException('Token invalido o incompleto');
    }
    return { 
      id: payload.sub, 
      email: payload.email,
      tipo: payload.tipo,
      rol: payload.rol,
      external: false,
    };
  }
}