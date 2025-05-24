import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from 'shared/services/auth/auth.service';
import { UsersService } from 'shared/services/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtService],
})
export class AuthModule {}
