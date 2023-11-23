import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { UpdateSeminarDto } from './dto/update-seminar.dto';
import { UpdatePipe } from './pipe/update.pipe';
import { SeminarsService } from './seminars.service';
import { Request } from 'express';
import { ApiResponseService } from '@/api-response/api-response.service';

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

  @Get('participants')
  @UseGuards(JwtAuthGuard)
  findInvolvedSeminars(@Req() req: Request) {
    return this.seminarsService.findInvolvedSeminars(req.user.userId);
  }

  @Get(':id(\\d+)')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.seminarsService.findOne(+id);
  }

  @Put(':id(\\d+)')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(
      UpdatePipe,
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    updateSeminarDto: UpdateSeminarDto,
  ) {
    await this.seminarsService.update(+id, updateSeminarDto);
    return ApiResponseService.SUCCESS('success');
  }

  @Delete(':id(\\d+)')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.seminarsService.remove(+id);
  }

  @Post('join')
  async joinSeminar(
    @Body('seminar_id', ParseIntPipe) seminar_id: number,
    @Body('user_id', ParseIntPipe) user_id: number,
  ) {
    const isExists = await this.seminarsService.isExistsRevertedParticipants(
      seminar_id,
      user_id,
    );
    /* 이미 신청한 후 취소한 이력이 있으면 다시 되살려서 신청처리 */
    if (isExists && isExists.deleted_at !== null) {
      await this.seminarsService.restoreJoinSeminar(isExists);
      ApiResponseService.SUCCESS('success restore exists seminar participants');
    } else {
      await this.seminarsService.joinSeminar(seminar_id, user_id);
      ApiResponseService.SUCCESS('success join seminar');
    }
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async confirmJoinSeminar(
    @Req() req: Request,
    @Body('seminar_id', ParseIntPipe) seminar_id,
  ) {
    const result = await this.seminarsService.confirmJoinSeminar(
      seminar_id,
      req.user.userId,
    );
    if (result) {
      ApiResponseService.SUCCESS('success confirm join seminar');
    } else {
      ApiResponseService.BAD_REQUEST('already confirmed');
    }
  }

  @Delete('cancel')
  @UseGuards(JwtAuthGuard)
  async cancelJoinSeminar(
    @Req() req: Request,
    @Body('seminar_id', ParseIntPipe) seminar_id: number,
  ) {
    await this.seminarsService.cancelJoinSeminar(seminar_id, req.user.userId);
    ApiResponseService.SUCCESS('success cancel join seminar');
  }
}
