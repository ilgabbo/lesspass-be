import { Controller, Get, HttpStatus, Req } from '@nestjs/common';
import { Request } from 'express';
import { Endpoint, HttpStatusText } from 'shared/enums';
import { ResponseModel, TokenPayloadModel } from 'shared/models';
import { UsersService } from 'shared/services';

@Controller(Endpoint.USER)
export class UserController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUser(@Req() req: Request): Promise<ResponseModel> {
    const payload: TokenPayloadModel = req['payload'] as TokenPayloadModel;
    const user = await this.usersService.findOne({
      userId: payload.userId,
    });
    if (user.status !== HttpStatus.OK) {
      return user;
    }

    return {
      status: HttpStatus.OK,
      message: HttpStatusText.OK,
      data: {
        userId: user.data!.userId,
        email: user.data!.email,
        firstName: user.data!.firstName,
        lastName: user.data!.lastName,
        createdAt: user.data!.createdAt,
        modifiedAt: user.data!.modifiedAt,
      },
    };
  }
}
