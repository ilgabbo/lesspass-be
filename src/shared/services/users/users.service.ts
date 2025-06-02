import { HttpStatus, Injectable } from '@nestjs/common';
import db from 'db';
import { users } from 'db/schema';
import { eq, or } from 'drizzle-orm';
import { HttpStatusText } from 'shared/enums/httpStatusText.enum';
import { UserFromTable } from 'shared/models/database.model';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';

@Injectable()
export class UsersService {
  async findOne(data: {
    email?: string;
    userId?: string;
  }): Promise<ServiceReturnValueModel<UserFromTable>> {
    if (!data.email && !data.userId) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Email or userId is required',
      };
    }

    const user = await db.query.users.findFirst({
      where: or(
        data.email ? eq(users.email, data.email) : undefined,
        data.userId ? eq(users.userId, data.userId) : undefined,
      ),
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
  }
}
