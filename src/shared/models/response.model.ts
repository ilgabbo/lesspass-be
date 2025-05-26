import { HttpStatus } from '@nestjs/common';
import { HttpStatusText } from 'shared/enums/httpStatusText.enum';

export interface ResponseModel<T = unknown> {
  status: HttpStatus;
  message: HttpStatusText | string;
  data?: T;
}
