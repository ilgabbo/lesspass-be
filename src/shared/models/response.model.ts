import { HttpStatus } from '@nestjs/common';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';

export interface ResponseModel<T = unknown> {
  status: HttpStatus;
  message: HttpStatusText | string;
  data?: T;
}
