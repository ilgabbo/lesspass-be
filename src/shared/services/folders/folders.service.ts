/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import db from 'db';
import { folders, users } from 'db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import { Folder } from 'shared/models/database.model';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';
import { TokenPayloadModel } from 'shared/models/token.model';

@Injectable({ scope: Scope.REQUEST })
export class FoldersService {
  constructor(@Inject(REQUEST) private readonly req: Request) {}

  async findMany(
    folderId?: string,
  ): Promise<ServiceReturnValueModel<Folder[]>> {
    try {
      const userId = (this.req['payload'] as TokenPayloadModel).userId;

      const resultFolders = (await db.query.folders.findMany({
        columns: {
          userId: false,
        },
        where: and(
          eq(users.userId, userId),
          folderId ? eq(folders.parentId, folderId) : isNull(folders.parentId),
        ),
      })) as Folder[];

      return {
        status: HttpStatus.OK,
        message: HttpStatusText.OK,
        data: resultFolders,
      };
    } catch (error) {
      console.error(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: HttpStatusText.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
