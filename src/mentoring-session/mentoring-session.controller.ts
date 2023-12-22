import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateMentoringSessionDto } from './dto/create-mentoring-session.dto';
import { UpdateMentoringSessionDto } from './dto/update-mentoring-session.dto';
import { MentoringSessionService } from './mentoring-session.service';
import { Request } from 'express';
import { SocketAuthGuard } from '@/auth/local-channel-auth.guard';
import { SystemSocketAuthGuard } from '@/auth/system-channel-auth.guard';

@Controller('mentoring-session')
export class MentoringSessionController {
  constructor(
    private readonly mentoringSessionService: MentoringSessionService,
  ) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.mentoringSessionService.findAll();
  }

  @UseGuards(SocketAuthGuard)
  @Get('users')
  findAllByUserId(@Req() req: Request) {
    return this.mentoringSessionService.findAllByUser(req.channels.user_id);
  }

  @UseGuards(SocketAuthGuard)
  @Get('users/not-read')
  findAllNotReadByUserId(@Req() req: Request) {
    return this.mentoringSessionService.findAllNotReadByUserId(
      req.channels.user_id,
    );
  }

  @UseGuards(SocketAuthGuard)
  @Get(':id(\\d+)')
  findOne(@Param('id') id: string) {
    return this.mentoringSessionService.findOne(+id);
  }

  @UseGuards(SystemSocketAuthGuard)
  @Get('session/:id(\\d+)')
  findOneBySessionId(@Param('id') id: string) {
    return this.mentoringSessionService.findOne(+id);
  }

  @Post()
  create(@Body() createMentoringSessionDto: CreateMentoringSessionDto) {
    return this.mentoringSessionService.create(createMentoringSessionDto);
  }

  @Put(':id(\\d+)')
  update(
    @Param('id') id: string,
    @Body() updateMentoringSessionDto: UpdateMentoringSessionDto,
  ) {
    return this.mentoringSessionService.update(+id, updateMentoringSessionDto);
  }

  @Delete(':id(\\d+)')
  remove(@Param('id') id: string) {
    return this.mentoringSessionService.remove(+id);
  }
}
