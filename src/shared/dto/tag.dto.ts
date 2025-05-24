/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  readonly color: string;
}

export class UpdateTagDto {
  @IsUUID()
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  readonly tagId: string;

  @IsString()
  @IsOptional()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly color: string;
}
