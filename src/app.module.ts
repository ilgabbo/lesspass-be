import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { LesspassModule } from './api/v1/lesspass/lesspass.module';
import { E2EMiddleware } from 'middleware/e2e/e2e.middleware';
import { JwtService } from '@nestjs/jwt';
import { FoldersService } from './shared/services/folders/folders.service';
import { RequestContextService } from './shared/services/request-context/request-context.service';
import { AuthMiddleware } from 'middleware/auth/auth.middleware';

@Module({
  imports: [LesspassModule],
  controllers: [AppController],
  providers: [JwtService, FoldersService, RequestContextService],
  exports: [AppModule, LesspassModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware, E2EMiddleware).forRoutes('*');
  }
}
