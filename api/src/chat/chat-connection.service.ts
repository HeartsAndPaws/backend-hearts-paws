import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatConnectionService {
    private connectedUsers = new Map<string, string>();

    addUser(userId: string, socketId: string){
        this.connectedUsers.set( userId, socketId);
    }

    removeUser(socketId: string){
        const userId = [ ...this.connectedUsers.entries()].find(
            ([, sId]) => sId === socketId,
        )?.[0];

        if (userId) {
            this.connectedUsers.delete(userId);
        }
    }

    isUserConnected(userId: string): boolean{
        return this.connectedUsers.has(userId);
    }

    getAll(): Map<string, string> {
        return this.connectedUsers;
    }
}