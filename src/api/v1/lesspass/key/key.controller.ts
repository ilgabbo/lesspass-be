import { Controller, Get, HttpStatus } from '@nestjs/common';
import { Endpoint } from 'shared/enums/endpoint.enum';
import env from 'shared/env';
import { ResponseModel } from 'shared/models/response.model';

@Controller(Endpoint.KEY)
export class KeyController {
  @Get()
  getServerPublicKey(): ResponseModel {
    return {
      status: HttpStatus.OK,
      message: 'OK',
      data: {
        key: env.SERVER_PUBLIC_KEY,
      },
    };
  }
}
