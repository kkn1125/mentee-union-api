import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMentoringDto {
  @IsNotEmpty()
  @IsNumber()
  mentor_id: number;

  @IsNotEmpty()
  @IsNumber()
  mentee_id: number;

  @IsNotEmpty()
  @IsNumber()
  mentoring_session_id: number;

  @IsNotEmpty()
  @IsString()
  status: string;
}
