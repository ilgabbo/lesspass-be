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
    try {
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
    } catch (error) {
      // TODO: error mapping
      console.error(error);

      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: HttpStatusText.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async findMany(tagIds?: string[]): Promise<ServiceReturnValueModel<Tag[]>> {
    try {
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
    tag: Partial<Tag>,
    tagId: string,
  ): Promise<ServiceReturnValueModel> {
    try {
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
    } catch (error) {
      // TODO: error mapping
      console.error(error);

      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: HttpStatusText.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async delete(tagIds: string[]): Promise<ServiceReturnValueModel> {
    try {
      await db
        .delete(tags)
        .where(
          and(eq(tags.userId, this.ctx.userId), inArray(tags.tagId, tagIds)),
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
