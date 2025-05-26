/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import db from 'db';
import { users } from 'db/schema';
import { NextFunction, Request, Response } from 'express';
import { processEncryption } from 'shared/lib/enc/processEncryption';
import { eq } from 'drizzle-orm';
import { noEncryptionEndpoints, noKeyEndpoints } from 'shared/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { env } from 'process';
import { HttpStatusText } from 'shared/enums';
import { TokenPayloadModel } from 'shared/models';

@Injectable()
export class E2EMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // these endpoints don't need encryption
    if (noEncryptionEndpoints.includes(req.originalUrl)) {
      return next();
    }

    let clientPublicKeyHex = '';
    if (noKeyEndpoints.includes(req.originalUrl)) {
      // TODO: custom message
      if (!req.body.key) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: HttpStatusText.BAD_REQUEST,
        });
      }
      clientPublicKeyHex = req.body.key;
    } else {
      // TODO: move this logic into auth middleware
      const token = req.headers.authorization?.split(' ')?.[1];
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

        const user = await db
          .select({
            publicKey: users.publicKey,
            tokenVersion: users.tokenVersion,
          })
          .from(users)
          .where(eq(users.userId, verifiedToken.userId));

        if (
          !user.length ||
          user[0].tokenVersion !== verifiedToken.tokenVersion
        ) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            status: HttpStatus.UNAUTHORIZED,
            message: HttpStatusText.UNAUTHORIZED,
          });
        }

        req['payload'] = verifiedToken;
        clientPublicKeyHex = user[0].publicKey;
      } catch (error) {
        // TODO: error mapping
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
