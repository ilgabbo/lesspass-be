/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import db from 'db';
import { users, folders } from 'db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { Request } from 'express';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import { Password } from 'shared/models/database.model';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';
import { TokenPayloadModel } from 'shared/models/token.model';

@Injectable({ scope: Scope.REQUEST })
export class PasswordsService {
  constructor(@Inject(REQUEST) private readonly req: Request) {}

  async findMany(
    folderId?: string,
  ): Promise<ServiceReturnValueModel<Password[]>> {
    try {
      const userId = (this.req['payload'] as TokenPayloadModel).userId;

      const resultPasswords = await db.query.passwords.findMany({
        where: and(
          eq(users.userId, userId),
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
          tags: password.tags.map((t2p) => ({
            tagId: t2p.tag.tagId,
            name: t2p.tag.name,
          })),
        })) as Password[];
      }

      return {
        status: HttpStatus.OK,
        message: HttpStatusText.OK,
        data: passwords,
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
