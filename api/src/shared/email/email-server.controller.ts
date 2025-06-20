import { Body, Controller, Post } from "@nestjs/common";
import { MailerService } from "./email-server.service";
import { SendMailOptions } from "./email-server.interface";

@Controller('mailer')
export class MailerController {
    constructor(private readonly mailerService: MailerService){}

    @Post('send')
    async sendMail(
        @Body() data: SendMailOptions
    ){
        return this.mailerService.enviarEMail(data);
    }
}