import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';
import { Response } from 'express';
import { HttpStatusText } from 'shared/enums';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(err: Error, host: ArgumentsHost) {
    console.error(err);
    const res = host.switchToHttp().getResponse<Response>();

    switch (err.constructor) {
      case SyntaxError:
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: HttpStatusText.BAD_REQUEST,
        });

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
