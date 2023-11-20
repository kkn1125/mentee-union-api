import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MentoringService } from './mentoring.service';
import { CreateMentoringDto } from './dto/create-mentoring.dto';
import { UpdateMentoringDto } from './dto/update-mentoring.dto';

@Controller('mentoring')
export class MentoringController {
  constructor(private readonly mentoringService: MentoringService) {}

  @Post()
  create(@Body() createMentoringDto: CreateMentoringDto) {
    return this.mentoringService.create(createMentoringDto);
  }

  @Get()
  findAll() {
    return this.mentoringService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mentoringService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMentoringDto: UpdateMentoringDto,
  ) {
    return this.mentoringService.update(+id, updateMentoringDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mentoringService.remove(+id);
  }
}
