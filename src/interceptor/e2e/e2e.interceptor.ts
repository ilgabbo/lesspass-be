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
import { Endpoint } from 'enums/endpoint.enum';
import { Request, Response } from 'express';
import { ResponseModel } from 'models/response.model';
import { processEncryption } from 'lib/enc/processEncryption';
import { map, Observable } from 'rxjs';
import db from 'db';
import { users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { env } from 'process';

@Injectable()
export class E2EInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Promise<ResponseModel>> {
    return next.handle().pipe(
      map(async (json: ResponseModel) => {
        const response = context.switchToHttp().getResponse<Response>();
        response.status(json.status);

        if (json.data) {
          const req = context.switchToHttp().getRequest<Request>();
          let clientPublicKeyHex = '';
          if (
            req.originalUrl === `${Endpoint.GLOBAL}/auth/signin` ||
            req.originalUrl === `${Endpoint.GLOBAL}/auth/signup`
          ) {
            clientPublicKeyHex = req.body.key;
          } else {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
              response.status(HttpStatus.UNAUTHORIZED);
              return {
                status: HttpStatus.UNAUTHORIZED,
                message: 'Invalid token',
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
                  message: 'Invalid token',
                };
              }
              response.status(HttpStatus.INTERNAL_SERVER_ERROR);
              return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal Server Error',
              };
            }
          }

          const encryptedData = processEncryption(
            clientPublicKeyHex,
            'encrypt',
            json.data,
          );

          const res = {
            status: json.status,
            message: json.message,
            data: encryptedData,
          };
          return res;
        }

        return json;
      }),
    );
  }
}
