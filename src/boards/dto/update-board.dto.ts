import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  view_count: number;
}
