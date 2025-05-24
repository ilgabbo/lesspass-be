import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { LesspassModule } from './api/v1/lesspass/lesspass.module';
import { E2EMiddleware } from 'middleware/e2e/e2e.middleware';
import { JwtService } from '@nestjs/jwt';
import { FoldersService } from './shared/services/folders/folders.service';

@Module({
  imports: [LesspassModule],
  controllers: [AppController],
  providers: [JwtService, FoldersService],
  exports: [AppModule, LesspassModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(E2EMiddleware).forRoutes('*');
  }
}
