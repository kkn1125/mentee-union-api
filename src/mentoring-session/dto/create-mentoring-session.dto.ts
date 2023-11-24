import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMentoringSessionDto {
  @IsNotEmpty()
  @IsString()
  category_id: number;

  @IsNotEmpty()
  @IsString()
  socket_url: string;

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
}
