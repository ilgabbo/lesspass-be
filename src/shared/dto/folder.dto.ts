import { Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';

export class FolderIdDto {
  @IsUUID()
  @IsNotEmpty()
  folderId: string;
}

export class DeleteFolderDto {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => FolderIdDto)
  folderIds: FolderIdDto[];
}

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsOptional()
  parentId: string | null | undefined;
}

export class UpdateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
