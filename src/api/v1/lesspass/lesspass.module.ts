import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { LesspassController } from './lesspass.controller';

@Module({
  imports: [AuthModule],
  controllers: [LesspassController],
})
export class LesspassModule {}
