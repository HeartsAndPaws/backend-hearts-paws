import { INestApplication, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from "socket.io";

export class CustomSocketIoAdapter extends IoAdapter {
    private readonly configService: ConfigService;

    constructor(app: INestApplication){
        super(app);
        this.configService = app.get(ConfigService);
    }

    createIoServer(port: number, options?: ServerOptions): any{
        const corsOrigins = this.configService.get<string>('CORS_ORIGINS')?.split(',') || [];
        const cors = {
            origin: corsOrigins,
            credentials: true,
        };

        Logger.log(`SocketIO CORS origins: ${corsOrigins.join(', ')}`, 'SocketAdapter');

        return super.createIOServer(port, { ...options, cors});
    }
}