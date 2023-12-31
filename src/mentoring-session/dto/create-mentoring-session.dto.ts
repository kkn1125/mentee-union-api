import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMentoringSessionDto {
  @IsNotEmpty()
  @IsString()
  category_id: number;

  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsNotEmpty()
  @IsString()
  objective: string;

  @IsNotEmpty()
  @IsString()
  format: string;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @IsString()
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  is_private: boolean;
}
