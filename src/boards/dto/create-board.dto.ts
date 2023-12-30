import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBoardDto {
  @IsOptional()
  @IsNumber()
  @IsEmpty()
  @Transform(({ value }) => Number(value))
  user_id: number;

  @IsOptional()
  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  visible: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  sequence: number = -1;
}
