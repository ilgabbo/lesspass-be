import { HttpStatus, Injectable } from '@nestjs/common';
import db from 'db';
import { tags, users } from 'db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { HttpStatusText } from 'shared/enums/httpStatusText.enum';
import { Tag } from 'shared/models/database.model';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';
import { RequestContextService } from '../request-context/request-context.service';

@Injectable()
export class TagsService {
  constructor(private readonly ctx: RequestContextService) {}

  async findOne(tagId: string): Promise<ServiceReturnValueModel<Tag>> {
    const tag = await db.query.tags.findFirst({
      where: and(eq(tags.tagId, tagId), eq(tags.userId, this.ctx.userId)),
    });

    if (!tag) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: HttpStatusText.NOT_FOUND,
      };
    }

    return {
      status: HttpStatus.OK,
      message: HttpStatusText.OK,
      data: tag,
    };
  }

  async findMany(tagIds?: string[]): Promise<ServiceReturnValueModel<Tag[]>> {
    const tagsResult = await db.query.tags.findMany({
      columns: {
        userId: false,
      },
      where: and(
        eq(users.userId, this.ctx.userId),
        tagIds ? inArray(tags.tagId, tagIds) : undefined,
      ),
    });

    return {
      status: HttpStatus.OK,
      message: HttpStatusText.OK,
      data: tagsResult,
    };
  }

  async updateOne(
    tag: Partial<Tag>,
    tagId: string,
  ): Promise<ServiceReturnValueModel> {
    const tagToUpdate = await this.findOne(tagId);

    if (tagToUpdate.status !== HttpStatus.OK) {
      return {
        status: tagToUpdate.status,
        message: tagToUpdate.message,
      };
    }
    await db
      .update(tags)
      .set(tag)
      .where(eq(tags.tagId, tagToUpdate.data!.tagId));

    return {
      status: HttpStatus.OK,
      message: HttpStatusText.OK,
    };
  }

  async delete(tagIds: string[]): Promise<ServiceReturnValueModel> {
    await db
      .delete(tags)
      .where(
        and(eq(tags.userId, this.ctx.userId), inArray(tags.tagId, tagIds)),
      );

    return {
      status: HttpStatus.OK,
      message: HttpStatusText.OK,
    };
  }
}
