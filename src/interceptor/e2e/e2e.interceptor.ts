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
import { noEncryptionEndpoints } from 'shared/config';

@Injectable()
export class E2EInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseModel> {
    return next.handle().pipe(
      map((res: ResponseModel) => {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();
        response.status(res.status);

        if (noEncryptionEndpoints.includes(request.originalUrl)) {
          return res;
        }

        if (!request?.headers['x-client-key']) {
          response.status(HttpStatus.BAD_REQUEST);
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'A key header is required to complete the request',
          };
        }
        const clientPublicKeyHex = request.headers['x-client-key'] as string;

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
