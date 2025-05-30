/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, Injectable } from '@nestjs/common';
import db from 'db';
import { folders, users } from 'db/schema';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { HttpStatusText } from 'shared/enums/httpStatusText.enum';
import { Folder } from 'shared/models/database.model';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';
import { RequestContextService } from '../request-context/request-context.service';
import {
  CreateFolderDto,
  DeleteFolderDto,
  UpdateFolderDto,
} from 'shared/dto/folder.dto';

@Injectable()
export class FoldersService {
  constructor(private readonly ctx: RequestContextService) {}

  async findMany(
    folderId?: string,
  ): Promise<ServiceReturnValueModel<Folder[]>> {
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
  }

  async createOne(folder: CreateFolderDto): Promise<ServiceReturnValueModel> {
    const existingFolder = await db.query.folders.findFirst({
      where: and(
        eq(folders.userId, this.ctx.userId),
        sql`lower(${folders.name}) = lower(${sql.param(folder.name)})`,
        ...(folder.parentId
          ? [eq(folders.parentId, folder.parentId)]
          : [isNull(folders.parentId)]),
      ),
    });
    if (existingFolder) {
      return {
        status: HttpStatus.CONFLICT,
        message: HttpStatusText.CONFLICT,
      };
    }

    await db.insert(folders).values({
      ...folder,
      userId: this.ctx.userId,
    });

    return {
      status: HttpStatus.CREATED,
      message: HttpStatusText.CREATED,
    };
  }

  async updateOne(
    folderId: string,
    data: UpdateFolderDto,
  ): Promise<ServiceReturnValueModel> {
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
  }

  async delete(folderIds: DeleteFolderDto): Promise<ServiceReturnValueModel> {
    await db.delete(folders).where(
      and(
        eq(folders.userId, this.ctx.userId),
        inArray(
          folders.folderId,
          folderIds.folderIds.map((folder) => folder.folderId),
        ),
      ),
    );

    return {
      status: HttpStatus.OK,
      message: HttpStatusText.OK,
    };
  }
}
