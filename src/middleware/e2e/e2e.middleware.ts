/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import db from 'db';
import { users } from 'db/schema';
import { Endpoint } from 'enums/endpoint.enum';
import env from 'env';
import { NextFunction, Request, Response } from 'express';
import { processEncryption } from 'lib/enc/processEncryption';
import { eq } from 'drizzle-orm';

@Injectable()
export class E2EMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    let clientPublicKeyHex = '';
    if (
      req.originalUrl === `${Endpoint.GLOBAL}/auth/signin` ||
      req.originalUrl === `${Endpoint.GLOBAL}/auth/signup`
    ) {
      clientPublicKeyHex = req.body.key;
    } else {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          status: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        });
      }

      const jose = await import('jose');
      try {
        const verifiedToken = await jose.jwtVerify(
          token,
          new TextEncoder().encode(env.JWT_SECRET),
        );

        const user = await db
          .select({ publicKey: users.publicKey })
          .from(users)
          .where(eq(users.userId, verifiedToken.payload.userId as string));
        clientPublicKeyHex = user[0].publicKey;
      } catch (error) {
        console.error(error);
        if (error instanceof jose.errors.JOSEError) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            status: HttpStatus.UNAUTHORIZED,
            message: 'Invalid token',
          });
        }
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        });
      }
    }

    const decryptedBody = processEncryption(
      clientPublicKeyHex,
      'decrypt',
      req.body.data,
    );

    req.body = {
      ...JSON.parse(decryptedBody),
      key: req.body.key,
    };
    return next();
  }
}
