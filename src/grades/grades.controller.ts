import { ApiResponseService } from '@/api-response/api-response.service';
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
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradesService } from './grades.service';

@Controller('grade')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  findAll() {
    return this.gradesService.findAll();
  }

  @Get(':id(\\d+)')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gradesService.findOne(+id);
  }

  @Post()
  async create(
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    createForumDto: CreateGradeDto,
  ) {
    await this.gradesService.create(createForumDto);
    ApiResponseService.SUCCESS('success create forum');
  }

  @Post('revert')
  async revert(
    @Body('id', ParseIntPipe)
    id: number,
  ) {
    await this.gradesService.restore(id);
    ApiResponseService.SUCCESS('success restore forum');
  }

  @Put(':id(\\d+)')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    updateForumDto: UpdateGradeDto,
  ) {
    await this.gradesService.update(+id, updateForumDto);
    ApiResponseService.SUCCESS('success update forum');
  }

  @Delete(':id(\\d+)')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.gradesService.softDelete(id);
    ApiResponseService.SUCCESS('success delete forum');
  }
}
