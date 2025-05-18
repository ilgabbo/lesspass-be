import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { LesspassModule } from './api/v1/lesspass/lesspass.module';
import { E2EMiddleware } from 'middleware/e2e/e2e.middleware';

@Module({
  imports: [LesspassModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(E2EMiddleware).forRoutes('*');
  }
}
