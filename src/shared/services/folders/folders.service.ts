/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, Injectable } from '@nestjs/common';
import db from 'db';
import { folders, users } from 'db/schema';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import { Folder } from 'shared/models/database.model';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';
import { RequestContextService } from '../request-context/request-context.service';
import { UpdateFolderDto } from 'shared/dto/folder.dto';

@Injectable()
export class FoldersService {
  constructor(private readonly ctx: RequestContextService) {}

  async findMany(
    folderId?: string,
  ): Promise<ServiceReturnValueModel<Folder[]>> {
    try {
      const resultFolders = (await db.query.folders.findMany({
        columns: {
          userId: false,
        },
        where: and(
          eq(users.userId, this.ctx.userId),
          folderId ? eq(folders.parentId, folderId) : isNull(folders.parentId),
        ),
      })) as Folder[];

      return {
        status: HttpStatus.OK,
        message: HttpStatusText.OK,
        data: resultFolders,
      };
    } catch (error) {
      // TODO: error mapping
      console.error(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: HttpStatusText.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async updateOne(
    folderId: string,
    data: UpdateFolderDto,
  ): Promise<ServiceReturnValueModel> {
    try {
      await db
        .update(folders)
        .set(data)
        .where(
          and(
            eq(folders.userId, this.ctx.userId),
            eq(folders.folderId, folderId),
          ),
        );

      return {
        status: HttpStatus.OK,
        message: HttpStatusText.OK,
      };
    } catch (error) {
      // TODO: error mapping
      console.error(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: HttpStatusText.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async delete(folderIds: string[]): Promise<ServiceReturnValueModel> {
    try {
      await db
        .delete(folders)
        .where(
          and(
            eq(folders.userId, this.ctx.userId),
            inArray(folders.folderId, folderIds),
          ),
        );

      return {
        status: HttpStatus.OK,
        message: HttpStatusText.OK,
      };
    } catch (error) {
      // TODO: error mapping
      console.error(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: HttpStatusText.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
