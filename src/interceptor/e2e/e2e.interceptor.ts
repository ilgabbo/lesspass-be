/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseModel } from 'shared/models/response.model';
import { processEncryption } from 'shared/lib/enc/processEncryption';
import { map, Observable } from 'rxjs';
import { users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { noKeyEndpoints, noEncryptionEndpoints } from 'shared/config';
import { HttpStatusText } from 'shared/enums/httpStatusText.enum';
import { TokenPayloadModel } from 'shared/models/token.model';
import db from 'db';

@Injectable()
export class E2EInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Promise<ResponseModel>> {
    return next.handle().pipe(
      map(async (res: ResponseModel) => {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();
        response.status(res.status);

        if (noEncryptionEndpoints.includes(request.originalUrl)) {
          return res;
        }

        let clientPublicKeyHex = '';

        if (noKeyEndpoints.includes(request.originalUrl)) {
          // TODO: custom message
          if (!request.body.key) {
            response.status(HttpStatus.BAD_REQUEST);
            return {
              status: HttpStatus.BAD_REQUEST,
              message: HttpStatusText.BAD_REQUEST,
            };
          }
          clientPublicKeyHex = request.body.key;
        } else {
          const tokenPayload = request['payload'] as TokenPayloadModel;
          const user = await db
            .select({
              publicKey: users.publicKey,
            })
            .from(users)
            .where(eq(users.userId, tokenPayload.userId));
          clientPublicKeyHex = user[0].publicKey;
        }

        if (res.data) {
          return {
            status: res.status,
            message: res.message,
            ...(request['token']
              ? {
                  token: processEncryption(
                    clientPublicKeyHex,
                    'encrypt',
                    request['token'] as string,
                  ),
                }
              : undefined),
            data: processEncryption(clientPublicKeyHex, 'encrypt', res.data),
          };
        }

        return {
          ...res,
          ...(request['token']
            ? {
                token: processEncryption(
                  clientPublicKeyHex,
                  'encrypt',
                  request['token'] as string,
                ),
              }
            : undefined),
        };
      }),
    );
  }
}
