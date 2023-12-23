import { PartialType } from '@nestjs/mapped-types';
import { CreateMentoringSessionDto } from './create-mentoring-session.dto';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

class ExtendsUpdateMentoringSessionDto extends CreateMentoringSessionDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class UpdateMentoringSessionDto extends PartialType(
  ExtendsUpdateMentoringSessionDto,
) {}
