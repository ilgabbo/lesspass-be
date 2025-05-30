import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Endpoint } from 'shared/enums';
import { HttpStatusText } from 'shared/enums';
import { ResponseModel } from 'shared/models';
import { TagsService } from 'shared/services';
import { CreateTagsDto, TagIdsDto, UpdateTagDto } from 'shared/dto';

@Controller(Endpoint.TAGS)
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  async getTags(): Promise<ResponseModel> {
    return await this.tagsService.findMany();
  }

  @Post()
  async createTags(@Body() body: CreateTagsDto): Promise<ResponseModel> {
    return await this.tagsService.create(body);
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
  async deleteTag(@Body() body: TagIdsDto): Promise<ResponseModel> {
    return await this.tagsService.delete(body);
  }
}
