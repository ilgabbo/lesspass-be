/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import db from 'db';
import { users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { Response, Request } from 'express';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import env from 'shared/env';
import { TokenPayloadModel } from 'shared/models/token.model';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: () => void) {
    console.log('AUTH -------------------------------------------------------');
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

      req['payload'] = verifiedToken;

      // TODO: if exp is greater or equal of (exp-2)mins, send new token and blacklist the old one

      const user = await db
        .select()
        .from(users)
        .where(eq(users.userId, verifiedToken.userId));
      if (!user.length) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          status: HttpStatus.UNAUTHORIZED,
          message: HttpStatusText.UNAUTHORIZED,
        });
      }
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
