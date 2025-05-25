import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { LesspassController } from './lesspass.controller';
import { KeyController } from './key/key.controller';
import { PasswordsController } from './passwords/passwords.controller';
import { TagsController } from './tags/tags.controller';
import { TagsService } from 'shared/services/tags/tags.service';
import { FoldersService } from 'shared/services/folders/folders.service';
import { PasswordsService } from 'shared/services/passwords/passwords.service';
import { FoldersController } from './folders/folders.controller';
import { RequestContextService } from 'shared/services/request-context/request-context.service';

@Module({
  imports: [AuthModule],
  controllers: [
    LesspassController,
    KeyController,
    PasswordsController,
    TagsController,
    FoldersController,
  ],
  providers: [
    TagsService,
    FoldersService,
    PasswordsService,
    RequestContextService,
  ],
})
export class LesspassModule {}
