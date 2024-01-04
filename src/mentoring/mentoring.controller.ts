import { ApiResponseService } from '@/api-response/api-response.service';
import { SocketAuthGuard } from '@/auth/local-channel-auth.guard';
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
} from '@nestjs/common';
import { Request } from 'express';
import { CreateMentoringDto } from './dto/create-mentoring.dto';
import { UpdateMentoringDto } from './dto/update-mentoring.dto';
import { MentoringService } from './mentoring.service';

@Controller('mentoring')
export class MentoringController {
  constructor(private readonly mentoringService: MentoringService) {}

  @Get()
  findAll() {
    return this.mentoringService.findAll();
  }

  @UseGuards(SocketAuthGuard)
  @Get('users')
  findAllByUser(@Req() req: Request) {
    return this.mentoringService.findAllByUserId(req.channels.user_id);
  }

  @Get(':id(\\d+)')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mentoringService.findOne(id);
  }

  @Post()
  create(@Body() createMentoringDto: CreateMentoringDto) {
    return this.mentoringService.create(createMentoringDto);
  }

  @Put(':id(\\d+)')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMentoringDto: UpdateMentoringDto,
  ) {
    return this.mentoringService.update(id, updateMentoringDto);
  }

  @Delete(':id(\\d+)')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mentoringService.softRemove(id);
    ApiResponseService.SUCCESS('success delete mentoring');
  }

  @Delete('session/:session_id(\\d+)/mentee/:mentee_id(\\d+)')
  async removeBySessionIdForMentee(
    @Param('session_id', ParseIntPipe) session_id: number,
    @Param('mentee_id', ParseIntPipe) mentee_id: number,
  ) {
    await this.mentoringService.removeBySessionId(session_id, mentee_id);
    await this.mentoringService.removeEmptyMentoringSession(session_id);
    ApiResponseService.SUCCESS('success delete mentoring');
  }

  @Post('revert')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.mentoringService.restore(id);
    ApiResponseService.SUCCESS('success revert mentoring');
  }
}
