import { Type } from 'class-transformer';
import {
  IsArray,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class TagIdDto {
  @IsUUID()
  @IsNotEmpty()
  readonly tagId: string;
}

export class TagDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  readonly color: string;
}

export class CreateTagsDto {
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @IsArray()
  @Type(() => TagDto)
  tags: TagDto[];
}

export class TagIdsDto {
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @IsArray()
  @Type(() => TagDto)
  tagIds: TagIdDto[];
}

export class UpdateTagDto {
  @IsUUID()
  @IsNotEmpty()
  readonly tagId: string;

  @IsString()
  @IsOptional()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly color: string;
}
