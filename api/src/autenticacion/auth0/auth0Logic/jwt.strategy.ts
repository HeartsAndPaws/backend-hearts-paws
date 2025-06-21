import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import * as dotenv from 'dotenv';
import { PrismaService } from 'src/prisma/prisma.service';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    
      const email = payload.email
      const nombre = payload.name || null
      const picture = payload.picture || null

      let user = await this.prisma.usuario.findUnique({
        where: { email }
      })

      if (!user) {
        user = await this.prisma.usuario.create({
          data: {
            email,
            nombre,
            rol: 'USUARIO',
            imagenPerfil: picture,
            contrasena: null,
            
          },
        });
      }
      

    
    
    return user;
  }
}
