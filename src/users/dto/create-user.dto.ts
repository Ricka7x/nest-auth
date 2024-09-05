import { Role } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles?: Role[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  image?: string;
}