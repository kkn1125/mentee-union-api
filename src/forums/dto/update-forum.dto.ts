import { PartialType } from '@nestjs/mapped-types';
import { CreateForumDto } from './create-forum.dto';

class ExtendsUpdateForumDto extends CreateForumDto {
  view_count: number;
}

export class UpdateForumDto extends PartialType(ExtendsUpdateForumDto) {}
