import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Transform } from 'class-transformer';
import { IsNumber, IsDate, IsString } from 'class-validator';

class UpdateAdditionalUserDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  fail_login_count: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  last_login_at: Date;

  @IsString()
  status: string;
}

export class UpdateUserDto extends PartialType(
  IntersectionType(CreateUserDto, UpdateAdditionalUserDto),
) {}
