import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from 'nodemailer';
import { SendMailOptions } from "./email-server.interface";


@Injectable()
export class MailerService {

    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService){
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASS'),
            },
        });
    }

    async enviarEMail(options: SendMailOptions): Promise<any>{
        return this.transporter.sendMail({
            from: this.configService.get('MAIL_USER'),
            ...options,
        });
    }

    async enviarEstadoActualizado(destinatario: string, estado: 'ACEPTADA' | 'RECHAZADA'){
        const subject = 'Estado de tu organización actualizado'
        const text =
            estado === 'ACEPTADA'
                ? '¡Felicidades! Tu organización ha sido aceptada en la plataforma.'
                : 'Lamentablemente, tu organización ha sido rechazada. Revisa los requisitos y vuelve a intentarlo.'
        
        return this.enviarEMail({
            to: destinatario,
            subject,
            text,
        })
    }

    async enviarConfirmacionRegistro(destinatario: string, nombreOrganizacion: string){
        const subject = '¡ Gracias por registrar tu Organización !';
        const text = `
        ¡Gracias por registrar tu organización, ${nombreOrganizacion}!
Hemos recibido la información de tu organización dedicada al cuidado, protección y difusión de animales en situación de calle.

En las próximas 24 horas recibirás un correo electrónico con el estado de tu solicitud: APROBADA o RECHAZADA, en caso de que no se haya podido validar algún tipo de documentación.

Si no recibís el correo dentro del plazo estipulado, recordá revisar la carpeta de correo no deseado.
        `;

        return this.enviarEMail({
            to: destinatario,
            subject,
            text,
        });
    }

}