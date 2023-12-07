import { PartialType } from '@nestjs/mapped-types';
import { CreateMentoringSessionDto } from './create-mentoring-session.dto';

export class UpdateMentoringSessionDto extends PartialType(
  CreateMentoringSessionDto,
) {}
