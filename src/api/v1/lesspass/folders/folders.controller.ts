import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { Endpoint } from 'shared/enums/endpoint.enum';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import { ResponseModel } from 'shared/models/response.model';
import { FoldersService } from 'shared/services/folders/folders.service';

@Controller()
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get(Endpoint.FOLDERS)
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
}
