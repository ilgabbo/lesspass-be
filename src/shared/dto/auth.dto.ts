/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { UserRole } from 'shared/enums/role.enum';

export class SigninDto {
  @IsEmail()
  @Length(3, 25)
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  email: string;

  @IsString()
  @Length(8, 20)
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  password: string;
}

export class SignupDto {
  @IsString()
  @Length(3, 25)
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  firstName: string;

  @IsString()
  @Length(3, 25)
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  lastName: string;

  @IsEmail()
  @Length(3, 25)
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  email: string;

  @IsString()
  @Length(8, 20)
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  @Transform(({ value }) => (value === null ? undefined : value))
  role: UserRole;
}
