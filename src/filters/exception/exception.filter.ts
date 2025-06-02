import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { Response } from 'express';
import { HttpStatusText } from 'shared/enums';
import { ValidationException } from 'shared/lib/exception/ValidationException/ValidationException';
import { ResponseModel } from 'shared/models';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(err: Error, host: ArgumentsHost) {
    console.log('************************************************************');
    console.log('*                       ERROR CATCHED                      *');
    console.log('************************************************************');
    console.error(err);
    const res = host.switchToHttp().getResponse<Response>();

    switch (err.constructor) {
      case SyntaxError:
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: HttpStatusText.BAD_REQUEST,
        });

      case JsonWebTokenError:
      case TokenExpiredError:
        return res.status(HttpStatus.UNAUTHORIZED).json({
          status: HttpStatus.UNAUTHORIZED,
          message: HttpStatusText.UNAUTHORIZED,
        });

      case ValidationException: {
        const error = JSON.parse(err.message) as ResponseModel;
        return res.status(error.status).json(error);
      }

      default:
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: HttpStatusText.INTERNAL_SERVER_ERROR,
        });
    }
  }
}
