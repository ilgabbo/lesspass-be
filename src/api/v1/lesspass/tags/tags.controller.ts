import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { Endpoint } from 'shared/enums/endpoint.enum';
import { HttpStatusText } from 'shared/enums/httpstatustext.enum';
import { ResponseModel } from 'shared/models/response.model';
import { TagsService } from 'shared/services/tags/tags.service';
import { TagIdDto, UpdateTagDto } from 'shared/dto/tag.dto';

@Controller(Endpoint.TAGS)
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  async getTags(): Promise<ResponseModel> {
    return await this.tagsService.findMany();
  }

  @Put(':tagId')
  async updateTag(
    @Param() params: UpdateTagDto,
    @Body() body: UpdateTagDto,
  ): Promise<ResponseModel> {
    if (!body.name && !body.color) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: HttpStatusText.BAD_REQUEST,
      };
    }

    return await this.tagsService.updateOne(body, params.tagId);
  }

  @Delete('delete')
  async deleteTag(@Body() body: TagIdDto[]): Promise<ResponseModel> {
    return await this.tagsService.delete(body.map((tag) => tag.tagId));
  }
}
