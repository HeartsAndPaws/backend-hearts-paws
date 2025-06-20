import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService){}

    async iniciarChat(usuarioId: string, organizacionId: string){
        const existente = await this.prisma.chat.findFirst({
            where: {
                usuarioId,
                organizacionId
            },
        });

        if(existente) {
            return {
                ok: true,
                mensaje: 'Ya existe un chat entre este usuario y esta organización',
                chat: existente,
            };
        }

        const nuevoChat = await this.prisma.chat.create({
            data: {
                usuarioId,
                organizacionId,
            },
        });

        return {
            ok: true,
            mensaje: 'Chat iniciado correctamente',
            chat: nuevoChat,
        }
    }

    async getChatsDeUsuario(usuarioId: string){
        const chats = await this.prisma.chat.findMany({
            where: { usuarioId},
            include: {
                organizacion: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        imagenPerfil: true,
                    },
                },
            },
        });
        return {
            ok: true,
            chats,
        };
    }

    async getChatDeOrganizacion(organizacionId: string){
        const chats = await this.prisma.chat.findMany({
            where: { organizacionId},
            include: {
                usuario: {
                    select: {
                        id: true, 
                        nombre: true, 
                        imagenPerfil: true, 
                        email: true},
                },
            },
        });

        return {
            ok: true,
            chats,
        }
    }

    async getMensajesDeChat(chatId: string){
        const mensajes = await this.prisma.mensaje.findMany({
            where: { chatId},
            orderBy: { enviado_en: 'asc'},
            include: {
                autorUsuario: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        imagenPerfil: true,
                    },
                },
                autorOrganizacion: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        imagenPerfil: true,
                    },
                },
            },
        });

        const mensajesNormalizados = mensajes.map((msg) => ({
            ...msg,
            autor: msg.autorUsuario || msg.autorOrganizacion,
        }));

        return {
            ok: true,
            mensajes: mensajesNormalizados,
        };
    }

    async getChatPorId(chatId: string){
        const chat = await this.prisma.chat.findUnique({
            where: { id: chatId}
        });

        if (!chat) {
            throw new NotFoundException('Chat no encontrado');
        }
        return chat;
    }

    async verificarAccesoAlChat(chatId: string, usuarioToken: { id: string; tipo: string}){
        const chat = await this.getChatPorId(chatId);

        const esParticipante = 
            (usuarioToken.tipo === 'USUARIO' && chat.usuarioId === usuarioToken.id) || 
            (usuarioToken.tipo === 'ONG' && chat.organizacionId === usuarioToken.id);

        if (!esParticipante) {
            throw new ForbiddenException('No tiene acceso a este chat');
        }

        return chat;
    }

    async crearMensaje(chatId: string, autorId: string, contenido: string) {
        const chat = await this.getChatPorId(chatId);

        const usuario = await this.prisma.usuario.findUnique({where: { id: autorId}});
        const esUsuario = Boolean(usuario)

        const mensaje = await this.prisma.mensaje.create({
            data: {
                contenido,
                chat: {
                    connect: { id: chatId},
                },
                ...(esUsuario
                    ? { autorUsuario: { connect: { id: autorId}}}
                    : { autorOrganizacion: { connect: { id: autorId}}}
                )
            },
            include: {
                autorUsuario: {
                    select: { id: true, nombre: true, email: true, imagenPerfil: true},
                },
                autorOrganizacion : {
                    select: { id: true, nombre: true, email: true, imagenPerfil: true},
                },
            },
        });

        return {
            ...mensaje,
            autor: mensaje.autorUsuario || mensaje.autorOrganizacion,
        }

    }
}
