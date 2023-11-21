import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSeminarDto {
  @IsNotEmpty()
  @IsNumber()
  host_id: number;

  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  title: string;

  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @IsNotEmpty()
  meeting_place: string;

  @IsNotEmpty()
  @Min(1)
  limit_participant_amount: number;

  @IsNotEmpty()
  recruit_start: Date;

  @IsNotEmpty()
  recruit_end: Date;

  @IsNotEmpty()
  seminar_start_date: Date;

  @IsNotEmpty()
  seminar_end_date: Date;

  @IsBoolean()
  is_recruit_finished: boolean;

  @IsBoolean()
  is_seminar_finished: boolean;
}
