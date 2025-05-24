import { HttpStatus, Injectable } from '@nestjs/common';
import db from 'db';
import { users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import { UserFromTable } from 'shared/models/database.model';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';

@Injectable()
export class UsersService {
  async findOne(
    email: string,
  ): Promise<ServiceReturnValueModel<UserFromTable>> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      return {
        status: HttpStatus.OK,
        message: HttpStatusText.OK,
        data: user as UserFromTable,
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
