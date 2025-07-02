import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ChatController } from "./chat.controller";
import { AuthModule } from "src/autenticacion/local/auth.module";
import { ChatConnectionService } from "./chat-connection.service";

@Module({
    imports: [AuthModule],
    controllers: [ ChatController],
    providers: [ ChatGateway, ChatService, PrismaService, ChatConnectionService],
    exports: [ChatService]
})

export class ChatModule {}