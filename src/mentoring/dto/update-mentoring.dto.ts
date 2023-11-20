import { PartialType } from '@nestjs/mapped-types';
import { CreateMentoringDto } from './create-mentoring.dto';

export class UpdateMentoringDto extends PartialType(CreateMentoringDto) {}
