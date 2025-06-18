import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";


@Injectable()
export class EmailService {

    private resend: Resend

    constructor(private readonly configService: ConfigService){
        this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    }

    async enviarEstadoActualizado(
        email: string,
        estado: 'ACEPTADA' | 'RECHAZADA',
    ){
        const subject = 'Estado de verificación de tu organización';

        const html = 
        estado === 'ACEPTADA'
            ? `<h2 style="color: green;">¡Felicitaciones!</h2><p>Tu organización ha sido <strong>aceptada</strong>. Ya puedes acceder al sistema.</p>`
            : `<h2 style="color: red;">Lo sentimos</h2><p>Tu organización ha sido <strong>rechazada</strong>. Puedes volver a aplicar más adelante.</p>`
        
        try {
            const data = await this.resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'heartsandpaws154@gmail.com',
                subject: 'Prueba de estado actualizado',
                html: '<h1>¡Tu correo de prueba fue enviado exitosamente!</h1>'
            });

            
        } catch (error) {
            console.error('❌ Error al enviar el correo:', error);
            throw error;
        }
    }
}