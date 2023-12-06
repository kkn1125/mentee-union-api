import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  auth_email: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  grade_id: number;

  @IsNotEmpty()
  @MinLength(2)
  username: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Matches(/^\d{2,3}-\d{4}-\d{4}$/g)
  phone_number: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  birth: Date;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gender: number;

  @IsNotEmpty()
  password: string;
}
