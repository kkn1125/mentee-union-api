import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GivePointsDto {
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
  points: number;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
