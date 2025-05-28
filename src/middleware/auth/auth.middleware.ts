/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import db from 'db';
import { users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { Response, Request } from 'express';
import { protectedRoutes } from 'shared/config';
import { HttpStatusText } from 'shared/enums/httpStatusText.enum';
import env from 'shared/env';
import { TokenPayloadModel } from 'shared/models/token.model';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: () => void) {
    if (!protectedRoutes.includes(req.originalUrl)) {
      return next();
    }

    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          status: HttpStatus.UNAUTHORIZED,
          message: HttpStatusText.UNAUTHORIZED,
        });
      }
      const verifiedToken: TokenPayloadModel =
        await this.jwtService.verifyAsync(token, {
          secret: env.JWT_SECRET,
        });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.userId, verifiedToken.userId));
      if (!user.length || user[0].tokenVersion !== verifiedToken.tokenVersion) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          status: HttpStatus.UNAUTHORIZED,
          message: HttpStatusText.UNAUTHORIZED,
        });
      }

      const remainingTime = Math.round(
        (verifiedToken.exp * 1000 - Date.now()) / 60000,
      );
      if (remainingTime - 2 <= 0) {
        // TODO
      }

      req['payload'] = {
        ...verifiedToken,
        clientPublicKey: user[0].publicKey,
      };
      next();
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
}
