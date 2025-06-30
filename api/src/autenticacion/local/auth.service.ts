import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { NuevoUsuarioDto } from 'src/autenticacion/dtos/NuevoUsuario.dto';
import { NuevaOrganizacionDto } from '../dtos/NuevaOrganizacion';
import { MailerService } from 'src/shared/email/email-server.service';

@Injectable()
export class ServicioAut {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService
  ) {}

  async registro(datosDeUsuario: NuevoUsuarioDto & 
    {imagenPerfil?: string}
  ) {
    const siElEmailEstaRegistrado = await this.prisma.usuario.findUnique({
      where: { email: datosDeUsuario.email },
    });

    if (siElEmailEstaRegistrado) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(datosDeUsuario.contrasena, 10);
    datosDeUsuario.contrasena = hashedPassword;

    const usuario = await this.prisma.usuario.create({
      data: {
        ...datosDeUsuario,
        contrasena: hashedPassword,
        imagenPerfil: datosDeUsuario.imagenPerfil ?? null,
        rol: 'USUARIO'
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        direccion: true,
        ciudad: true,
        pais: true,
        imagenPerfil: true,
        rol: true,
      }
    });

    return {
      ok: true,
      mensaje: 'Usuario registrado con éxito',
      usuario: usuario
    }
  }


  async ingreso(email: string, contrasena: string) {
    console.log('📥 Email recibido:', email);
    console.log('🔑 Contraseña recibida:', contrasena);

    const usuarioEncontrado = await this.prisma.usuario.findUnique({
      where: { email },
    });

    console.log('👤 Usuario encontrado:', usuarioEncontrado);

    if (!usuarioEncontrado) {
      console.log('❌ No se encontró el usuario con ese email.');
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    console.log('🧂 Contraseña hasheada en BD:', usuarioEncontrado.contrasena);

    const isValidPassword = await bcrypt.compare(
      contrasena,
      usuarioEncontrado.contrasena,
    );

    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta')
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const userPayload = {
      sub: usuarioEncontrado.id,
      id: usuarioEncontrado.id,
      email: usuarioEncontrado.email,
      rol: usuarioEncontrado.rol,
      tipo: 'USUARIO'
    };

    const token = this.jwtService.sign(userPayload);

    console.log('✅ Login exitoso, generando token:', token);

    return { 
      ok: 'Usuario logueado exitosamente', 
      token,
      usuario: {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        telefono: usuarioEncontrado.telefono,
        direccion: usuarioEncontrado.direccion,
        ciudad: usuarioEncontrado.ciudad,
        pais: usuarioEncontrado.pais,
        imagenPerfil: usuarioEncontrado.imagenPerfil,
        rol: usuarioEncontrado.rol,
      }
    };
  }

  async ingresoOrganizacion(email: string, contrasena: string){
    const organizacion = await this.prisma.organizacion.findUnique({where: {email}});

    if (!organizacion) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (organizacion.estado !== 'APROBADA') {
      throw new UnauthorizedException('Tu organización aún no ha sido aprobada por un administrador.')
    }

    const isValidPassword = await bcrypt.compare(contrasena, organizacion.contrasena);

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: organizacion.id,
      id: organizacion.id,
      email: organizacion.email,
      plan: organizacion.plan,
      tipo: 'ONG',
      rol: 'ONG',
    };

    const token = this.jwtService.sign(payload);
    return {
      ok: 'Organización logueada exitosamente',
      token,
      organizacion: {
        id: organizacion.id,
        nombre: organizacion.nombre,
        descripcion: organizacion.descripcion,
        telefono: organizacion.telefono,
        direccion: organizacion.direccion,
        ciudad: organizacion.ciudad,
        pais: organizacion.pais,
        plan: organizacion.plan,
        imagenPerfil: organizacion.imagenPerfil,
      }
    }
  }

  async crearOrganizacion(data: NuevaOrganizacionDto & {
    archivoVerificacionUrl: string;
    imagenPerfil?: string
  }): Promise<any>{
    const existe = await this.prisma.organizacion.findUnique({
      where: { email: data.email},
    });

    if (existe) {
      throw new ConflictException('El email ya está registrado')
    }

    const contraseñaHash = await bcrypt.hash(data.contrasena, 10);

    const nuevaOrganizacion = await this.prisma.organizacion.create({
      data: {
        ...data,
        contrasena: contraseñaHash,
        archivoVerificacionUrl: data.archivoVerificacionUrl,
        imagenPerfil: data.imagenPerfil ?? null,
        estado: 'PENDIENTE',
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        creado_en: true,
        archivoVerificacionUrl: true,
        imagenPerfil: true,
      }
    });

    // Enviar correo de confirmación de registro
    await this.mailerService.enviarConfirmacionRegistro(
      nuevaOrganizacion.email,
      nuevaOrganizacion.nombre,
    );

    return {
      ok: true,
      mensaje: 'Organización registrada con éxito. Está pendiente de aprobación por un administrador.',
      organizacion: nuevaOrganizacion,
    }
  }

  async logout(){
    return { ok: true, mensaje: 'Sesión cerrada'}
  }

}
