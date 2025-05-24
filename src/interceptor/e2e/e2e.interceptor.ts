/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import db from 'db';
import { users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { env } from 'process';
import { noSecretEndpoints, noEncryptionEndpoints } from 'shared/config/config';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';

@Injectable()
export class E2EInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Promise<ResponseModel>> {
    return next.handle().pipe(
      map(async (json: ResponseModel) => {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();
        response.status(json.status);

        if (noEncryptionEndpoints.includes(request.originalUrl)) {
          return json;
        }
        if (json.data) {
          let clientPublicKeyHex = '';
          if (noSecretEndpoints.includes(request.originalUrl)) {
            clientPublicKeyHex = request.body.key;
          } else {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
              response.status(HttpStatus.UNAUTHORIZED);
              return {
                status: HttpStatus.UNAUTHORIZED,
                message: HttpStatusText.UNAUTHORIZED,
              };
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
                .where(
                  eq(users.userId, verifiedToken.payload.userId as string),
                );
              clientPublicKeyHex = user[0].publicKey;
            } catch (error) {
              console.error(error);
              if (error instanceof jose.errors.JOSEError) {
                response.status(HttpStatus.UNAUTHORIZED);
                return {
                  status: HttpStatus.UNAUTHORIZED,
                  message: HttpStatusText.UNAUTHORIZED,
                };
              }
              response.status(HttpStatus.INTERNAL_SERVER_ERROR);
              return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: HttpStatusText.INTERNAL_SERVER_ERROR,
              };
            }
          }

          const encryptedData = processEncryption(
            clientPublicKeyHex,
            'encrypt',
            json.data,
          );

          return {
            status: json.status,
            message: json.message,
            data: encryptedData,
          };
        }

        return json;
      }),
    );
  }
}
