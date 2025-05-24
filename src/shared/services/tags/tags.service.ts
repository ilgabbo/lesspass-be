import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import db from 'db';
import { tags, users } from 'db/schema';
import { and, eq } from 'drizzle-orm';
import { Request } from 'express';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import { Tag } from 'shared/models/database.model';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';
import { TokenPayloadModel } from 'shared/models/token.model';

@Injectable({ scope: Scope.REQUEST })
export class TagsService {
  constructor(@Inject(REQUEST) private readonly req: Request) {}

  async findOne(tagId: string): Promise<ServiceReturnValueModel<Tag>> {
    try {
      const userId = (this.req['payload'] as TokenPayloadModel).userId;
      const tag = await db.query.tags.findFirst({
        where: and(eq(tags.tagId, tagId), eq(tags.userId, userId)),
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
      console.error(error);

      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: HttpStatusText.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async findMany(): Promise<ServiceReturnValueModel<Tag[]>> {
    try {
      const userId = (this.req['payload'] as TokenPayloadModel).userId;
      const tags = await db.query.tags.findMany({
        columns: {
          userId: false,
        },
        where: eq(users.userId, userId),
      });

      return {
        status: HttpStatus.OK,
        message: HttpStatusText.OK,
        data: tags,
      };
    } catch (error) {
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
      console.error(error);

      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: HttpStatusText.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async deleteOne(tagId: string): Promise<ServiceReturnValueModel> {
    try {
      const tagToDelete = await this.findOne(tagId);

      if (tagToDelete.status !== HttpStatus.OK) {
        return {
          status: tagToDelete.status,
          message: tagToDelete.message,
        };
      }
      await db.delete(tags).where(eq(tags.tagId, tagId));

      return {
        status: HttpStatus.OK,
        message: HttpStatusText.OK,
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
