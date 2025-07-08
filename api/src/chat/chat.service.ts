import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ChatConnectionService } from "./chat-connection.service";
import { strict } from "assert";

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
        private connectionService: ChatConnectionService,
    ){}

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
                ultimoMensaje: {
                    select: {
                        id: true,
                        contenido: true,
                        enviado_en: true,
                        autorUsuario: {
                            select: { id: true, nombre: true},
                        },
                        autorOrganizacion: {
                            select: { id: true, nombre: true},
                        },
                    },
                },
            },
        });

        const chatsConAutor = chats.map(chat => ({
            ...chat,
            ultimoMensaje: chat.ultimoMensaje && {
                id: chat.ultimoMensaje.id,
                contenido: chat.ultimoMensaje.contenido,
                enviado_en: chat.ultimoMensaje.enviado_en,
                autor: chat.ultimoMensaje.autorUsuario
                    ? { ...chat.ultimoMensaje.autorUsuario, tipo: 'USUARIO'}
                    : { ...chat.ultimoMensaje.autorOrganizacion, tipo: 'ONG'}
            }
        }));

        return {
            ok: true,
            chats: chatsConAutor,
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
                ultimoMensaje: {
                    select: {
                        id: true,
                        contenido: true,
                        enviado_en: true,
                        autorUsuario: {
                            select: { id: true, nombre: true },
                        },
                        autorOrganizacion: {
                            select: { id: true, nombre: true },
                        },
                    },
                },
            },
        });

        const chatsConAutor = chats.map(chat => ({
            ...chat,
            ultimoMensaje: chat.ultimoMensaje && {
                id: chat.ultimoMensaje.id,
                contenido: chat.ultimoMensaje.contenido,
                enviado_en: chat.ultimoMensaje.enviado_en,
                autor: chat.ultimoMensaje.autorUsuario
                    ? { ...chat.ultimoMensaje.autorUsuario, tipo: 'USUARIO' }
                    : { ...chat.ultimoMensaje.autorOrganizacion, tipo: 'ONG '},
            },
        }));

        return {
            ok: true,
            chats: chatsConAutor,
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

        const mensajesNormalizados = mensajes.map((msg) => {
            const autor = msg.autorUsuario
                ? { ...msg.autorUsuario, tipo: 'USUARIO'}
                : msg.autorOrganizacion
                ? { ...msg.autorOrganizacion, tipo: 'ONG'}
                : null;

            return {
                id: msg.id,
                contenido: msg.contenido,
                enviado_en: msg.enviado_en,
                autor,
            }
        })

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

        await this.prisma.chat.update({
            where: { id: chatId },
            data: { ultimoMensajeId: mensaje.id},
        });

        return {
            ...mensaje,
            autor: mensaje.autorUsuario || mensaje.autorOrganizacion,
        }
    }

    async getUsuariosConEstado(nombre: string | undefined, ongId: string){

        const donadores = await this.prisma.donacion.findMany({
            where: { organizacionId: ongId },
            select: { usuarioId: true },
            distinct: ['usuarioId'],
        });

        const solicitudes = await this.prisma.solicitudDeAdopcion.findMany({
            where: {
                casoAdopcion: {
                    caso: {
                        ongId: ongId,
                    },
                },    
            },
            select: { usuarioId: true },
            distinct: ['usuarioId'],
        });

        const usuariosIds = [
            ...new Set([
                ...donadores.map(d => d.usuarioId),
                ...solicitudes.map(s => s.usuarioId),
            ].filter((id): id is string => typeof id === 'string')),
        ];

        if (usuariosIds.length === 0) return [];

        const usuarios = await this.prisma.usuario.findMany({
            where: {
                id: { in: usuariosIds },
                ...(nombre && {
                    nombre: {
                        contains: nombre,
                        mode: 'insensitive'
                    },
                }),
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                imagenPerfil: true,
            },
        });

        return usuarios.map((usuario) => ({
            ...usuario,
            conectado: this.connectionService.isUserConnected(usuario.id),
        }));
    }

    async getOrganizacionesConEstado(nombre: string | undefined, usuarioId: string){
        
        const donaciones = await this.prisma.donacion.findMany({
            where: { usuarioId },
            select: { organizacionId: true },
            distinct: ['organizacionId'],
        })

        const solicitudes = await this.prisma.solicitudDeAdopcion.findMany({
            where: {
                usuarioId,
            },
            select: {
                casoAdopcion: {
                    select: {
                        caso: {
                            select: {
                                ongId: true,
                            },
                        },
                    },
                },
            },
        });

        const ongIds = [
            ...new Set([
                ...donaciones.map(d => d.organizacionId),
                ...solicitudes.map(s => s.casoAdopcion?.caso?.ongId),
            ].filter((id): id is string => typeof id === 'string')),
        ];
        
        if (ongIds.length === 0) return [];
        
        const organizaciones = await this.prisma.organizacion.findMany({
            where: {
                id: { in: ongIds },
                ...(nombre && {
                    nombre: {
                        contains: nombre,
                        mode: 'insensitive',
                    },
                }),
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                imagenPerfil: true,
            },
        });

        return organizaciones.map((ong) => ({
            ...ong,
            conectado: this.connectionService.isUserConnected(ong.id),
        }));
    }
}
