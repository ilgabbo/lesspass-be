/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, Injectable } from '@nestjs/common';
import db from 'db';
import { users, folders, passwords } from 'db/schema';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { HttpStatusText } from 'shared/enums/httpStatusText.enum';
import { Password, Tag } from 'shared/models/database.model';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';
import { RequestContextService } from '../request-context/request-context.service';

@Injectable()
export class PasswordsService {
  constructor(private readonly ctx: RequestContextService) {}

  async findMany(
    folderId?: string,
  ): Promise<ServiceReturnValueModel<Password[]>> {
    try {
      const resultPasswords = await db.query.passwords.findMany({
        where: and(
          eq(users.userId, this.ctx.userId),
          folderId ? eq(folders.folderId, folderId) : isNull(folders.folderId),
        ),
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
          folder: true,
        },
      });

      let passwords: Password[] = [];

      if (resultPasswords.length) {
        passwords = resultPasswords.map((password) => ({
          passwordId: password.passwordId,
          createdAt: password.createdAt,
          modifiedAt: password.modifiedAt,
          title: password.title,
          description: password.description,
          username: password.username,
          url: password.url,
          password: password.password,
          folderId: password.folderId,
          tags: password.tags.map((t2p: Record<string, Tag>) => ({
            tagId: t2p.tag.tagId,
            name: t2p.tag.name,
            color: t2p.tag.color,
          })),
        })) as Password[];
      }

      return {
        status: HttpStatus.OK,
        message: HttpStatusText.OK,
        data: passwords,
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
    passwordId: string,
    updatedPassword: Partial<Password>,
  ): Promise<ServiceReturnValueModel> {
    try {
      const password = await db.query.passwords.findFirst({
        where: and(
          eq(users.userId, this.ctx.userId),
          eq(passwords.passwordId, passwordId),
        ),
      });
      if (!password) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: HttpStatusText.NOT_FOUND,
        };
      }

      await db
        .update(passwords)
        .set(updatedPassword)
        .where(
          and(
            eq(passwords.userId, this.ctx.userId),
            eq(passwords.passwordId, passwordId),
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

  async delete(passwordIds: string[]): Promise<ServiceReturnValueModel> {
    try {
      await db
        .delete(passwords)
        .where(
          and(
            eq(passwords.userId, this.ctx.userId),
            inArray(passwords.passwordId, passwordIds),
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
