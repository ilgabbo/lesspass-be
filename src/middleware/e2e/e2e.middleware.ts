/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { processEncryption } from 'shared/lib/enc/processEncryption';
import { noEncryptionEndpoints, noKeyEndpoints } from 'shared/config';
import { HttpStatusText } from 'shared/enums';
import { TokenPayloadModel } from 'shared/models';

@Injectable()
export class E2EMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // these endpoints don't need encryption
    if (noEncryptionEndpoints.includes(req.originalUrl)) {
      return next();
    }

    let clientPublicKeyHex = '';
    // user is registering or authenticating and will send his public key
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
      // the user is calling protected routes, it means that she/he is authenticated
      const tokenPayload = req['payload'] as TokenPayloadModel;
      clientPublicKeyHex = tokenPayload.clientPublicKey;
    }

    if (!req.body.data) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: HttpStatusText.BAD_REQUEST,
      });
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
