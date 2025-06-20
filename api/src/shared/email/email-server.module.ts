import { Module } from "@nestjs/common";
import { MailerService } from "./email-server.service";
import { ConfigModule } from "@nestjs/config";
import { MailerController } from "./email-server.controller";

@Module({
    imports: [ConfigModule],
    controllers: [MailerController],
    providers: [MailerService],
    exports: [MailerService],
})

export class EmailModule {}