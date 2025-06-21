import { IsEmail, IsString } from "class-validator";

export class SyncUserDto{
    @IsString()
    sub: string; // Id unico de Auth0

    @IsEmail()
    email: string;

    @IsString()
    name: string;
}