import { HttpStatus } from '@nestjs/common';

export interface ResponseModel {
  status: HttpStatus;
  message: string;
  data?: unknown;
}
