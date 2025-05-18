import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Endpoint } from './enums/endpoint.enum';
import env from 'env';
import { E2EInterceptor } from 'interceptor/e2e/e2e.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(Endpoint.GLOBAL);
  app.useGlobalInterceptors(new E2EInterceptor());
  await app.listen(env.API_PORT);
}
void bootstrap();
