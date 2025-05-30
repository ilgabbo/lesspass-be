import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreateFolderDto,
  DeleteFolderDto,
  FolderIdDto,
  UpdateFolderDto,
} from 'shared/dto';
import { Endpoint } from 'shared/enums';
import { HttpStatusText } from 'shared/enums';
import { ResponseModel } from 'shared/models';
import { FoldersService } from 'shared/services';

@Controller(Endpoint.FOLDERS)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  async folders(
    @Query('folderId') folderId: string | undefined,
  ): Promise<ResponseModel> {
    const folders = await this.foldersService.findMany(folderId);
    if (folders.status !== HttpStatus.OK) {
      return folders;
    }

    return {
      status: HttpStatus.OK,
      message: HttpStatusText.OK,
      data: folders.data || [],
    };
  }

  @Post()
  async createFolder(@Body() body: CreateFolderDto): Promise<ResponseModel> {
    return await this.foldersService.createOne(body);
  }

  @Put(':folderId')
  async updateFolder(
    @Param() params: FolderIdDto,
    @Body() body: UpdateFolderDto,
  ): Promise<ResponseModel> {
    return await this.foldersService.updateOne(params.folderId, body);
  }

  @Delete('delete')
  async delete(@Body() body: DeleteFolderDto): Promise<ResponseModel> {
    return await this.foldersService.delete(body);
  }
}
