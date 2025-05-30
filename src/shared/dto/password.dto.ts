import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class PasswordIdDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  passwordId: string;
}

export class DeletePasswordsDto {
  @ValidateNested({ each: true })
  @IsArray()
  @IsNotEmpty()
  @Type(() => PasswordIdDto)
  passwordIds: Array<{ passwordId: string }>;
}

export class CreatePasswordDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  url: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  folderId: string | null;

  @IsArray()
  @IsOptional()
  tags: Array<{ tagId: string; name: string; color: string }>;
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
