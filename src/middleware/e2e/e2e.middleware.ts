/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import db from 'db';
import { users } from 'db/schema';
import { NextFunction, Request, Response } from 'express';
import { processEncryption } from 'shared/lib/enc/processEncryption';
import { eq } from 'drizzle-orm';
import { noEncryptionEndpoints, noKeyEndpoints } from 'shared/config/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { env } from 'process';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import { TokenPayloadModel } from 'shared/models/token.model';

@Injectable()
export class E2EMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // this endpoint doesn't need encryption
    if (noEncryptionEndpoints.includes(req.originalUrl)) {
      return next();
    }

    let clientPublicKeyHex = '';
    if (noKeyEndpoints.includes(req.originalUrl)) {
      clientPublicKeyHex = req.body.key;
    } else {
      // const userId = req['payload'].userId;
      // clientPublicKeyHex = await db
      //   .select({ publicKey: users.publicKey })
      //   .from(users)
      //   .where(eq(users.userId, userId))[0];
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          status: HttpStatus.UNAUTHORIZED,
          message: HttpStatusText.UNAUTHORIZED,
        });
      }

      try {
        const verifiedToken: TokenPayloadModel =
          await this.jwtService.verifyAsync(token, {
            secret: env.JWT_SECRET,
          });

        req['payload'] = verifiedToken;

        const user = await db
          .select({ publicKey: users.publicKey })
          .from(users)
          .where(eq(users.userId, verifiedToken.userId));
        clientPublicKeyHex = user[0].publicKey;
      } catch (error) {
        console.error(error);

        switch (error.constructor) {
          case TokenExpiredError:
          case JsonWebTokenError:
            return res.status(HttpStatus.UNAUTHORIZED).json({
              status: HttpStatus.UNAUTHORIZED,
              message: HttpStatusText.UNAUTHORIZED,
            });

          default:
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: HttpStatusText.INTERNAL_SERVER_ERROR,
            });
        }
      }
    }

    const decryptedBody = processEncryption(
      clientPublicKeyHex,
      'decrypt',
      req.body.data,
    );

    if (noKeyEndpoints.includes(req.originalUrl)) {
      req.body = {
        ...JSON.parse(decryptedBody),
        key: req.body.key,
      };
    } else {
      req.body = JSON.parse(decryptedBody);
    }

    return next();
  }
}
