import { PartialType } from '@nestjs/mapped-types';
import { CreateSeminarDto } from './create-seminar.dto';
import { IsEmpty, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

class ExtendsUpdateSeminarDto extends CreateSeminarDto {
  @IsOptional()
  @IsNumber()
  view_count: number;
}

export class UpdateSeminarDto extends PartialType(ExtendsUpdateSeminarDto) {}
