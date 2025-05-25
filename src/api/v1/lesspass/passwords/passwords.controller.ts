import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { PasswordIdDto, UpdatePasswordDto } from 'shared/dto/password.dto';
import { Endpoint } from 'shared/enums/endpoint.enum';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import { ResponseModel } from 'shared/models/response.model';
import { PasswordsService } from 'shared/services/passwords/passwords.service';

@Controller(Endpoint.PASSWORDS)
export class PasswordsController {
  constructor(private readonly passwordsService: PasswordsService) {}

  @Get()
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

  @Put(':passwordId')
  async updatePassword(
    @Param() params: PasswordIdDto,
    @Body() body: UpdatePasswordDto,
  ): Promise<ResponseModel> {
    return await this.passwordsService.updateOne(params.passwordId, body);
  }

  @Delete('delete')
  async delete(@Body() body: PasswordIdDto[]): Promise<ResponseModel> {
    try {
      return await this.passwordsService.delete(
        body.map((item) => item.passwordId),
      );
    } catch (error) {
      console.error(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: HttpStatusText.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
