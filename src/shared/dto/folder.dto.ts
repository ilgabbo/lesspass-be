/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class FolderIdDto {
  @IsUUID()
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  folderId: string;
}

export class UpdateFolderDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  name: string;
}
