/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, Injectable } from '@nestjs/common';
import db from 'db';
import { users, folders, passwords, tags, tagsToPasswords } from 'db/schema';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { HttpStatusText } from 'shared/enums/httpStatusText.enum';
import { Password, Tag } from 'shared/models/database.model';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';
import { RequestContextService } from '../request-context/request-context.service';
import { CreatePasswordDto, DeletePasswordsDto } from 'shared/dto';

@Injectable()
export class PasswordsService {
  constructor(private readonly ctx: RequestContextService) {}

  async findMany(
    folderId?: string,
  ): Promise<ServiceReturnValueModel<Password[]>> {
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
  }

  async create(password: CreatePasswordDto): Promise<ServiceReturnValueModel> {
    if (password.folderId) {
      const folder = await db.query.folders.findFirst({
        where: and(
          eq(users.userId, this.ctx.userId),
          eq(folders.folderId, password.folderId),
        ),
      });
      if (!folder) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: HttpStatusText.NOT_FOUND,
        };
      }
    }

    let passwordTags: { tagId: string }[] = [];
    if (password.tags && password.tags.length) {
      passwordTags = await db.query.tags.findMany({
        columns: {
          tagId: true,
        },
        where: and(
          eq(users.userId, this.ctx.userId),
          inArray(
            tags.tagId,
            password.tags.map((tag) => tag.tagId),
          ),
        ),
      });
      if (!passwordTags.length) {
        passwordTags = await db
          .insert(tags)
          .values(
            password.tags.map((tag) => ({
              name: tag.name,
              color: tag.color,
              userId: this.ctx.userId,
            })),
          )
          .returning({ tagId: tags.tagId });
      }
    }

    await db.transaction(async (tx) => {
      const insertedPassword = await tx
        .insert(passwords)
        .values({
          title: password.title,
          username: password.username,
          password: password.password,
          userId: this.ctx.userId,
          folderId: password.folderId,
        })
        .returning({ passwordId: passwords.passwordId });

      if (passwordTags.length) {
        await tx.insert(tagsToPasswords).values(
          passwordTags.map((tag) => ({
            tagId: tag.tagId,
            passwordId: insertedPassword[0].passwordId,
          })),
        );
      }
    });

    return {
      status: HttpStatus.CREATED,
      message: HttpStatusText.CREATED,
    };
  }

  async updateOne(
    passwordId: string,
    updatedPassword: Partial<Password>,
  ): Promise<ServiceReturnValueModel> {
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
  }

  async delete(
    passwordIds: DeletePasswordsDto,
  ): Promise<ServiceReturnValueModel> {
    await db.delete(passwords).where(
      and(
        eq(passwords.userId, this.ctx.userId),
        inArray(
          passwords.passwordId,
          passwordIds.passwordIds.map((pass) => pass.passwordId),
        ),
      ),
    );

    return {
      status: HttpStatus.OK,
      message: HttpStatusText.OK,
    };
  }
}
