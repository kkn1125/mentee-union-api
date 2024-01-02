import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GivePointsDto {
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  giver_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  receiver_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Max(15)
  @Min(5)
  points: number = 5;

  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(150)
  @Transform(({ value }) => value || '')
  reason: string = '';
}
