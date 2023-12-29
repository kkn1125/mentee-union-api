import { PartialType } from '@nestjs/mapped-types';
import { CreateSeminarDto } from './create-seminar.dto';
import { IsEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

class ExtendsUpdateSeminarDto extends CreateSeminarDto {}

export class UpdateSeminarDto extends PartialType(ExtendsUpdateSeminarDto) {}
