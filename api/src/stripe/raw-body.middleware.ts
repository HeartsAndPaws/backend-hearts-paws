import { json } from "body-parser";

export const rawBodyMiddleware = () =>
    json({
        verify: (req: any, res, buf: Buffer) => {
            if (req.orinalUrl === 'stripe/webhook') {
                req.rawBody = buf;
            }
        },
    });