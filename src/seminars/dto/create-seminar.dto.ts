import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsBefore } from '../validator/is-before.decorator';

export class CreateSeminarDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  host_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  category_id: number;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  title: string;

  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @IsNotEmpty()
  @MinLength(1)
  meeting_place: string;

  @IsNotEmpty()
  @Max(50)
  @Min(2)
  @Transform(({ value }) => Number(value))
  limit_participant_amount: number = 2;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  recruit_start_date: Date;

  @IsNotEmpty()
  @IsBefore('recruit_start_date', {
    message: '모집 시작시간이 모집 마감시간보다 클 수 없습니다.',
  })
  @Transform(({ value }) => new Date(value))
  recruit_end_date: Date;

  @IsNotEmpty()
  @IsBefore('recruit_end_date', {
    message:
      '모집 종료시간이 세미나 시작시간보다 클 수 없습니다. 모집 종료시간은 세미나 시작시간과 1일 정도의 여유가 있어야합니다.',
  })
  @Transform(({ value }) => new Date(value))
  seminar_start_date: Date;

  @IsNotEmpty()
  @IsBefore('seminar_start_date', {
    message: '세미나 시작시간이 세미나 종료시간보다 클 수 없습니다.',
  })
  @Transform(({ value }) => new Date(value))
  seminar_end_date: Date;

  @IsBoolean()
  is_recruit_finished: boolean = false;

  @IsBoolean()
  is_seminar_finished: boolean = false;
}
