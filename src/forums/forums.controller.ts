import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ForumsService } from './forums.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { ApiResponseService } from '@/api-response/api-response.service';

@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Get()
  findAll() {
    return this.forumsService.findAll();
  }

  @Get(':id(\\d+)')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.forumsService.findOne(+id);
  }

  @Post()
  async create(
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    createForumDto: CreateForumDto,
  ) {
    await this.forumsService.create(createForumDto);
    ApiResponseService.SUCCESS('success create forum');
  }

  @Post('revert')
  async revert(
    @Body('id', ParseIntPipe)
    id: number,
  ) {
    await this.forumsService.restore(id);
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
    updateForumDto: UpdateForumDto,
  ) {
    await this.forumsService.update(+id, updateForumDto);
    ApiResponseService.SUCCESS('success update forum');
  }

  @Delete(':id(\\d+)')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.forumsService.softDelete(id);
    ApiResponseService.SUCCESS('success delete forum');
  }
}
