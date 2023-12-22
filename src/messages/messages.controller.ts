import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Request } from 'express';
import { SocketAuthGuard } from '@/auth/local-channel-auth.guard';
import { ApiResponseService } from '@/api-response/api-response.service';
import { SystemSocketAuthGuard } from '@/auth/system-channel-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(+id);
  }

  @Get('session/:mentoring_session_id')
  findMessagesInSession(
    @Param('mentoring_session_id', ParseIntPipe) mentoring_session_id: number,
  ) {
    return this.messagesService.findMessagesInSession(mentoring_session_id);
  }

  // @UseGuards(SocketAuthGuard)
  // @Post('read/message/:message_id(\\d+)')
  // readMessage(
  //   @Req() req: Request,
  //   @Param('message_id', ParseIntPipe) message_id: number,
  // ) {
  //   return this.messagesService.readMessage(req.channels.user_id, message_id);
  // }

  @UseGuards(SocketAuthGuard)
  @Post('read/session/:session_id(\\d+)')
  readSessionsMessage(
    @Req() req: Request,
    @Param('session_id', ParseIntPipe) session_id: number,
  ) {
    return this.messagesService.readSessionsMessage(
      req.channels.user_id,
      session_id,
    );
  }

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @UseGuards(SocketAuthGuard)
  @Post('save')
  async saveMessage(
    @Req() req: Request,
    @Body('session_id', ParseIntPipe) session_id: number,
    @Body('message') message: string,
  ) {
    // const userId = req.channels.user_id;
    const messageDto = await this.messagesService.create({
      // user_id: userId,
      message,
      mentoring_session_id: session_id,
    });
    return this.messagesService.readMessage(
      req.channels.user_id,
      messageDto.id,
    );
  }

  @UseGuards(SystemSocketAuthGuard)
  @Post('save/session/:session_id(\\d+)')
  async saveSystemMessage(
    @Req() req: Request,
    @Param('session_id', ParseIntPipe) session_id: number,
    @Body('message') message: string,
  ) {
    const messageDto = await this.messagesService.create({
      // user_id: null,
      message,
      mentoring_session_id: session_id,
    });
    return this.messagesService.readSystemsMessage(session_id, messageDto.id);
    // return this.messagesService.readMessage(
    //   req.channels.user_id,
    //   messageDto.id,
    // );
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(+id, updateMessageDto);
  }

  @UseGuards(SocketAuthGuard)
  @Delete('soft/:message_id(\\d+)')
  async softDeleteMessage(
    @Req() req: Request,
    @Param('message_id', ParseIntPipe) message_id: number,
  ) {
    const messageDto = await this.messagesService.softRemove(message_id);
    return messageDto;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(+id);
  }
}
