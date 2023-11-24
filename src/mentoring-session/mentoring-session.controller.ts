import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateMentoringSessionDto } from './dto/create-mentoring-session.dto';
import { UpdateMentoringSessionDto } from './dto/update-mentoring-session.dto';
import { MentoringSessionService } from './mentoring-session.service';

@Controller('mentoring-session')
export class MentoringSessionController {
  constructor(
    private readonly mentoringSessionService: MentoringSessionService,
  ) {}

  @Post()
  create(@Body() createMentoringSessionDto: CreateMentoringSessionDto) {
    return this.mentoringSessionService.create(createMentoringSessionDto);
  }

  @Get()
  findAll() {
    return this.mentoringSessionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mentoringSessionService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMentoringSessionDto: UpdateMentoringSessionDto,
  ) {
    return this.mentoringSessionService.update(+id, updateMentoringSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mentoringSessionService.remove(+id);
  }
}
