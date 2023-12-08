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

@Controller('mentoring-session')
export class MentoringSessionController {
  constructor(
    private readonly mentoringSessionService: MentoringSessionService,
  ) {}

  @Get()
  findAll() {
    return this.mentoringSessionService.findAll();
  }

  @UseGuards(SocketAuthGuard)
  @Get('users')
  findAllByUserId(@Req() req: Request) {
    return this.mentoringSessionService.findAllByUser(req.channels.user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mentoringSessionService.findOne(+id);
  }

  @Post()
  create(@Body() createMentoringSessionDto: CreateMentoringSessionDto) {
    return this.mentoringSessionService.create(createMentoringSessionDto);
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
