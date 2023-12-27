import { Transform } from 'class-transformer';
import {
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateForumDto {
  @IsNumber()
  @IsEmpty()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @MinLength(1)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;
}
