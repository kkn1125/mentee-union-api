import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(
    @Query('seminars') seminars: boolean,
    @Query('mentoringSessions') mentoringSessions: boolean,
  ) {
    return this.categoriesService.findAll({ seminars, mentoringSessions });
  }

  @Get(':id(\\d+)')
  findOne(@Param('id') id: number) {
    return this.categoriesService.findOne(+id);
  }

  @Get('value/:value')
  findOneByValue(@Param('value') value: string) {
    return this.categoriesService.findOneByValue(value);
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id(\\d+)')
  update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id(\\d+)')
  remove(@Param('id') id: number) {
    return this.categoriesService.remove(+id);
  }
}
