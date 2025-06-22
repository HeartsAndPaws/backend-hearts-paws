import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAutCookiesGuardia implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = request.cookies?.authToken;

        if (!token) throw new UnauthorizedException('Token no encontrado');

        try {
            const secret = process.env.JWT_SECRET
            const payload = this.jwtService.verify(token, {secret});

            request.user = {
                id: payload.sub,
                email: payload.email,
                tipo: payload.tipo,
                rol: payload.rol || null
            };

            return true

        } catch (e) {
            throw new UnauthorizedException('Token inválido');
    }
}
}