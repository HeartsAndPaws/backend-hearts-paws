import { Module } from "@nestjs/common";
import { StripeService } from "./stripe.service";
import { StripeController } from "./stripe.controller";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    providers: [StripeService, PrismaService],
    controllers: [ StripeController],
    exports: [StripeService],
})

export class StripeModule {}