import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAutCookiesGuardia } from "src/autenticacion/guards/jwtAut.guardia";

@Controller('chats')
@UseGuards(JwtAutCookiesGuardia)
export class ChatController {
    constructor(private readonly chatService: ChatService){}

    @Post('iniciar')
    async iniciarChat(
        @Body() body: { usuarioId: string; organizacionId: string},
        @Request() req,
    ){
        const { tipo, id: solicitanteId } = req.user;

        if (tipo === 'USUARIO') {
            if (solicitanteId !== body.usuarioId) {
                throw new ForbiddenException('No puedes iniciar un chat por otro usuario');
            }
        }

        else if (tipo === 'ONG'){
            if (solicitanteId !== body.organizacionId) {
                throw new ForbiddenException('No puedes iniciar un chat por otra organización');
            }
        }

        else {
            throw new ForbiddenException('No autorizado para iniciar chats');
        }

        return await this.chatService.iniciarChat(body.usuarioId, body.organizacionId);
    }

    @Get('usuario/:id')
    async getChatsDeUsuario(@Param('id') usuarioId: string, @Request() req){
        if (req.user.tipo !== 'USUARIO') {
            throw new ForbiddenException('Solo los usuarios pueden acceder a esta ruta');
        }

        if (req.user.id !== usuarioId) {
            throw new ForbiddenException('No puedes ver los chats de otro usuario');
        }
        return await this.chatService.getChatsDeUsuario(usuarioId);
    }


    @Get('organizacion/:id')
    async getChatsDeOrganizacion(
        @Param('id') organizacionId: string,
        @Request() req,
    ){
        if (req.user.tipo !== 'ONG') {
            throw new ForbiddenException('Solo las organizaciones pueden acceder a esta ruta');
        }

        if (req.user.id !== organizacionId) {
            throw new ForbiddenException('No puedes ver los chats de otra organizacion');
        }

        return await this.chatService.getChatDeOrganizacion(organizacionId);
    }

    @Get(':chatId/mensajes')
    async getMensajesDeChat(
        @Param('chatId') chatId: string,
        @Request() req,
    ){
        await this.chatService.verificarAccesoAlChat(chatId, req.user);
        
        return await this.chatService.getMensajesDeChat(chatId);
    }

    @Get('usuarios')
    async getUsuariosConEstado(
        @Request() req,
        @Query('q') q?: string,
    ){
        if (req.user.tipo !== 'ONG') {
            throw new ForbiddenException('Solo las organizaciones pueden acceder a esta ruta');
        }

        return await this.chatService.getUsuariosConEstado(q, req.user.id);
    }

    @Get('organizaciones')
    async getOrganizacionesConEstado(
        @Request() req,
        @Query('q') q?: string,
    ){
        if (req.user.tipo !== 'USUARIO') {
            throw new ForbiddenException('Solo los usuarios pueden acceder a esta ruta');
        }

        return await this.chatService.getOrganizacionesConEstado(q, req.user.id);
    }

}