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
import { env } from 'process';
import { noKeyEndpoints, noEncryptionEndpoints } from 'shared/config';
import { HttpStatusText } from 'shared/enums/httpStatusText.enum';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { TokenPayloadModel } from 'shared/models/token.model';
import db from 'db';

@Injectable()
export class E2EInterceptor implements NestInterceptor {
  private readonly jwtService = new JwtService();

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

        if (res.data) {
          let clientPublicKeyHex = '';

          // thinking of moving this logic into a service
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
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
              response.status(HttpStatus.UNAUTHORIZED);
              return {
                status: HttpStatus.UNAUTHORIZED,
                message: HttpStatusText.UNAUTHORIZED,
              };
            }

            try {
              const verifiedToken: TokenPayloadModel =
                await this.jwtService.verifyAsync(token, {
                  secret: env.JWT_SECRET,
                });

              const user = await db
                .select({ publicKey: users.publicKey })
                .from(users)
                .where(eq(users.userId, verifiedToken.userId));
              clientPublicKeyHex = user[0].publicKey;
            } catch (error) {
              console.error(error);
              if (error instanceof JsonWebTokenError) {
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
            res.data,
          );

          return {
            status: res.status,
            message: res.message,
            data: encryptedData,
          };
        }

        return res;
      }),
    );
  }
}
