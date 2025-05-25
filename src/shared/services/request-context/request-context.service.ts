import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TokenPayloadModel } from 'shared/models/token.model';

@Injectable()
export class RequestContextService {
  public readonly userId: string;

  constructor(@Inject(REQUEST) private readonly req: Request) {
    this.userId = (this.req['payload'] as TokenPayloadModel).userId;
  }
}
