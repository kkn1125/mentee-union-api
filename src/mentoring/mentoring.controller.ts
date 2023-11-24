import {
  Body,
  Controller,
  Delete,
  Get,
  // HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  // Req,
  // Res,
} from '@nestjs/common';
import { CreateMentoringDto } from './dto/create-mentoring.dto';
import { UpdateMentoringDto } from './dto/update-mentoring.dto';
import { MentoringService } from './mentoring.service';
import { ApiResponseService } from '@/api-response/api-response.service';
// import { Request, Response } from 'express';
// import * as cryptoJS from 'crypto-js';
// import { WebSocketServer } from '@nestjs/websockets';

@Controller('mentoring')
export class MentoringController {
  constructor(private readonly mentoringService: MentoringService) {}

  // @Get('test')
  // // @HttpCode(101)
  // sockettest(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  //   const magicString = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  //   const websocketKey = req.headers['sec-websocket-key'];
  //   const shasum = cryptoJS
  //     .SHA1(websocketKey + magicString)
  //     .toString(cryptoJS.enc.Base64);
  //   console.log(websocketKey);
  //   console.log(shasum);

  //   res.setHeader('Upgrade', 'websocket');
  //   res.setHeader('Connection', 'Upgrade');
  //   res.setHeader('Sec-WebSocket-Accept', shasum);
  //   // res.setHeader('Sec-WebSocket-Version', '13');
  //   res.status(101);
  //   res.send('ok');
  //   // return this.mentoringService.findAll();
  // }

  @Get()
  findAll() {
    return this.mentoringService.findAll();
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
    await this.mentoringService.remove(id);
    ApiResponseService.SUCCESS('success delete mentoring');
  }

  @Post('revert')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.mentoringService.restore(id);
    ApiResponseService.SUCCESS('success revert mentoring');
  }
}
