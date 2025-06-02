import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Endpoint } from './shared/enums/endpoint.enum';
import env from 'shared/env';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { E2EInterceptor } from 'interceptor/e2e/e2e.interceptor';
import { CustomExceptionFilter } from 'filters/exception/exception.filter';
import { ValidationException } from 'shared/lib/exception/ValidationException/ValidationException';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(Endpoint.GLOBAL);

  app.useGlobalInterceptors(new E2EInterceptor());
  app.useGlobalFilters(new CustomExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((err) => ({
          field: err.property,
          errors: Object.values(err.constraints || {}),
        }));
        return new ValidationException(
          JSON.stringify({
            status: HttpStatus.BAD_REQUEST,
            message: 'Validation failed',
            data: messages,
          }),
        );
      },
    }),
  );

  await app.listen(env.API_PORT);
}
void bootstrap();
