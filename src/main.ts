import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Endpoint } from './shared/enums/endpoint.enum';
import env from 'shared/env';
import { E2EInterceptor } from 'interceptor/e2e/e2e.interceptor';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(Endpoint.GLOBAL);
  app.useGlobalInterceptors(new E2EInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((err) => ({
          field: err.property,
          errors: Object.values(err.constraints || {}),
        }));
        return new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          data: messages,
        });
      },
    }),
  );
  await app.listen(env.API_PORT);
}
void bootstrap();
