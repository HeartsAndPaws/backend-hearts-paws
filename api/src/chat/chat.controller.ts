import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAutCookiesGuardia } from "src/autenticacion/guards/jwtAut.guardia";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { AuthenticateRequest } from "src/common/interfaces/authenticated-request.interface";

@ApiTags('Chats')
@ApiBearerAuth()
@Controller('chats')

export class ChatController {
    constructor(private readonly chatService: ChatService){}

    @UseGuards(AuthGuard(['jwt-local', 'supabase']))
    @Post('iniciar')
    @ApiOperation({ summary: 'Iniciar un nuevo chat entre usuario y organización' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                usuarioId: { type: 'string', example: '1c1e61de-5d7a-4e67-87e5-1e228d92cd12' },
                organizacionId: { type: 'string', example: '6c0e0fbe-3a7d-4b56-b3fa-70d97069ee14' }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'Chat iniciado correctamente.' })
    @ApiResponse({ status: 403, description: 'No autorizado para iniciar chats.' })
    async iniciarChat(
        @Body() body: { organizacionId: string},
        @Request() req: AuthenticateRequest,
    ){
        const { tipo, id: solicitanteId } = req.user;

        if (tipo === 'USUARIO') {
            return await this.chatService.iniciarChat(solicitanteId, body.organizacionId);
        }
        
        else if (tipo === 'ONG'){
            const usuarioId = (req.body as any).usuarioId;

            if (!usuarioId) {
                throw new ForbiddenException('Debe proporcionar el ID del usuario');
            }

            if ( solicitanteId !== body.organizacionId) {
                throw new ForbiddenException('No puedes iniciar un chat por otra organizacion');
            }


            return await this.chatService.iniciarChat(usuarioId, solicitanteId);
        }

        throw new ForbiddenException('No autorizado para iniciar chats');
    }

    @UseGuards(AuthGuard(['jwt-local', 'supabase']))
    @Get('usuario/:id')
    @ApiOperation({ summary: 'Obtener los chats de un usuario autenticado' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Lista de chats del usuario' })
    @ApiResponse({ status: 403, description: 'Solo los usuarios autenticados pueden acceder a sus chats.' })
    async getChatsDeUsuario(
        @Param('id') usuarioId: string, 
        @Request() req: AuthenticateRequest){
        if (req.user.tipo !== 'USUARIO') {
            throw new ForbiddenException('Solo los usuarios pueden acceder a esta ruta');
        }

        if (req.user.id !== usuarioId) {
            throw new ForbiddenException('No puedes ver los chats de otro usuario');
        }
        return await this.chatService.getChatsDeUsuario(usuarioId);
    }

    @UseGuards(AuthGuard(['jwt-local']))
    @Get('organizacion/:id')
    @ApiOperation({ summary: 'Obtener los chats de una organización autenticada' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID de la organización' })
    @ApiResponse({ status: 200, description: 'Lista de chats de la organización' })
    @ApiResponse({ status: 403, description: 'Solo las organizaciones autenticadas pueden acceder a sus chats.' })
    async getChatsDeOrganizacion(
        @Param('id') organizacionId: string,
        @Request() req: AuthenticateRequest,
    ){
        if (req.user.tipo !== 'ONG') {
            throw new ForbiddenException('Solo las organizaciones pueden acceder a esta ruta');
        }

        if (req.user.id !== organizacionId) {
            throw new ForbiddenException('No puedes ver los chats de otra organizacion');
        }

        return await this.chatService.getChatDeOrganizacion(organizacionId);
    }


    @UseGuards(AuthGuard(['jwt-local', 'supabase']))
    @Get(':chatId/mensajes')
    @ApiOperation({ summary: 'Obtener mensajes de un chat, validando acceso' })
    @ApiParam({ name: 'chatId', type: 'string', description: 'ID del chat' })
    @ApiResponse({ status: 200, description: 'Lista de mensajes del chat' })
    @ApiResponse({ status: 403, description: 'No tienes acceso a este chat.' })
    async getMensajesDeChat(
        @Param('chatId') chatId: string,
        @Request() req: AuthenticateRequest,
    ){
        await this.chatService.verificarAccesoAlChat(chatId, req.user);
        return await this.chatService.getMensajesDeChat(chatId);
    }


    @UseGuards(AuthGuard(['jwt-local']))
    @Get('usuarios')
    @ApiOperation({ summary: 'ONG: Buscar usuarios con los que tiene chats o historial' })
    @ApiQuery({ name: 'q', type: 'string', required: false, description: 'Filtro de búsqueda' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios relacionados con la ONG y su estado de chat' })
    @ApiResponse({ status: 403, description: 'Solo las organizaciones pueden acceder a esta ruta.' })
    async getUsuariosConEstado(
        @Request() req: AuthenticateRequest,
        @Query('q') q?: string,
    ){
        if (req.user.tipo !== 'ONG') {
            throw new ForbiddenException('Solo las organizaciones pueden acceder a esta ruta');
        }
        return await this.chatService.getUsuariosConEstado(q, req.user.id);
    }


    @UseGuards(AuthGuard(['jwt-local', 'supabase']))
    @Get('organizaciones')
    @ApiOperation({ summary: 'Usuario: Buscar organizaciones con las que tiene chats o historial' })
    @ApiQuery({ name: 'q', type: 'string', required: false, description: 'Filtro de búsqueda' })
    @ApiResponse({ status: 200, description: 'Lista de organizaciones relacionadas con el usuario y su estado de chat' })
    @ApiResponse({ status: 403, description: 'Solo los usuarios pueden acceder a esta ruta.' })
    async getOrganizacionesConEstado(
        @Request() req: AuthenticateRequest,
        @Query('q') q?: string,
    ){
        if (req.user.tipo !== 'USUARIO') {
            throw new ForbiddenException('Solo los usuarios pueden acceder a esta ruta');
        }
        return await this.chatService.getOrganizacionesConEstado(q, req.user.id);
    }
}
