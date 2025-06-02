/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { processEncryption } from 'shared/lib/enc/processEncryption';
import { noEncryptionEndpoints, noKeyEndpoints } from 'shared/config';

@Injectable()
export class E2EMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // these endpoints don't need encryption
    if (noEncryptionEndpoints.includes(req.originalUrl)) {
      return next();
    }

    if (!req.headers['x-client-key']) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'A key header is required to complete the request',
      });
    }
    const clientPublicKeyHex = req.headers['x-client-key'] as string;

    if (req.method !== 'GET') {
      if (!req.body?.data) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: 'Data is required',
        });
      }

      const decryptedBody = processEncryption(
        clientPublicKeyHex,
        'decrypt',
        req.body.data,
      );

      if (noKeyEndpoints.includes(req.originalUrl)) {
        req.body = JSON.parse(decryptedBody);
      } else {
        req.body = JSON.parse(decryptedBody);
      }
    }

    return next();
  }
}
