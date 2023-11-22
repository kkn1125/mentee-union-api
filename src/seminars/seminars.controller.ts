import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { UpdateSeminarDto } from './dto/update-seminar.dto';
import { SeminarsService } from './seminars.service';
import { UpdatePipe } from './pipe/update.pipe';

@Controller('seminars')
export class SeminarsController {
  constructor(private readonly seminarsService: SeminarsService) {}

  @Post()
  create(
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    createSeminarDto: CreateSeminarDto,
  ) {
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

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(
      UpdatePipe,
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    updateSeminarDto: UpdateSeminarDto,
  ) {
    return this.seminarsService.update(+id, updateSeminarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seminarsService.remove(+id);
  }

  @Post('join')
  joinSeminar(
    @Body('seminar_id', ParseIntPipe) seminar_id: number,
    @Body('user_id', ParseIntPipe) user_id: number,
  ) {
    return this.seminarsService.joinSeminar(seminar_id, user_id);
  }
}
