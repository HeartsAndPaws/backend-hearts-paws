import { Body, Controller, Post } from "@nestjs/common";
import { MailerService } from "./email-server.service";
import { SendMailOptions } from "./email-server.interface";
import { ApiOperation, ApiBody, ApiTags, ApiResponse } from "@nestjs/swagger";

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
    constructor(private readonly mailerService: MailerService){}

    @ApiOperation({ summary: 'Envía un email al usuario' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                to: { type: 'string', example: 'usuario@ejemplo.com' },
                subject: { type: 'string', example: 'Bienvenido a la plataforma' },
                text: { type: 'string', example: 'Gracias por registrarte en nuestra plataforma.' }
            },
            required: ['to', 'subject', 'text']
        },
        examples: {
            ejemplo: {
                summary: 'Ejemplo de envío de email',
                value: {
                    to: 'usuario@ejemplo.com',
                    subject: 'Bienvenido a la plataforma',
                    text: 'Gracias por registrarte en nuestra plataforma.'
                }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'Email enviado correctamente.' })
    @Post('send')
    async sendMail(
        @Body() data: SendMailOptions
    ){
        return this.mailerService.enviarEMail(data);
    }
}
