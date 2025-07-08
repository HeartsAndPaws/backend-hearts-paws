import { Request } from "express";

export interface AuthenticateRequest extends Request {
    user: {
        id: string;
        email: string;
        tipo: string;
        rol: string;
        external: boolean;
    }
}