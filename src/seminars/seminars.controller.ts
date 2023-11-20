import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeminarsService } from './seminars.service';
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { UpdateSeminarDto } from './dto/update-seminar.dto';

@Controller('seminars')
export class SeminarsController {
  constructor(private readonly seminarsService: SeminarsService) {}

  @Post()
  create(@Body() createSeminarDto: CreateSeminarDto) {
    return this.seminarsService.create(createSeminarDto);
  }

  @Get()
  findAll() {
    return this.seminarsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seminarsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeminarDto: UpdateSeminarDto) {
    return this.seminarsService.update(+id, updateSeminarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seminarsService.remove(+id);
  }
}
