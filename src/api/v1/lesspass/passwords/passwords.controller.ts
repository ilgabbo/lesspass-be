/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { Endpoint } from 'shared/enums/endpoint.enum';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import { ResponseModel } from 'shared/models/response.model';
import { PasswordsService } from 'shared/services/passwords/passwords.service';

@Controller()
export class PasswordsController {
  constructor(private readonly passwordsService: PasswordsService) {}

  @Get(Endpoint.PASSWORDS)
  async passwords(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('folderId') folderId: string | undefined,
  ): Promise<ResponseModel> {
    try {
      const passwords = await this.passwordsService.findMany(folderId);
      if (passwords.status !== HttpStatus.OK) {
        return passwords;
      }

      return {
        status: HttpStatus.OK,
        message: HttpStatusText.OK,
        data: passwords.data || [],
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
