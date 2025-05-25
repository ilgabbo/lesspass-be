/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class PasswordIdDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  passwordId: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  url: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  folderId: string | null;

  @IsArray()
  @IsOptional()
  tags: Array<{ tagId: string; name: string; color: string }>;
}
