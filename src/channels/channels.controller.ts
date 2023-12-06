import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { LocalAuthGuard } from './local-channel-auth.guard';
import { Request } from 'express';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post('token')
  provideToken() {
    return this.channelsService.provideToken();
  }

  @UseGuards(LocalAuthGuard)
  @Get('verify')
  verifyToken(@Req() req: Request) {
    return this.channelsService.verifyToken(req.channels.token);
  }

  @UseGuards(LocalAuthGuard)
  @Get()
  findAll() {
    return this.channelsService.findAll();
  }

  @Get(':id(\\d+)')
  findOne(@Param('id') id: string) {
    return this.channelsService.findOne(+id);
  }

  @Post()
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelsService.create(createChannelDto);
  }

  @Put(':id(\\d+)')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelsService.update(+id, updateChannelDto);
  }

  @Delete(':id(\\d+)')
  remove(@Param('id') id: string) {
    return this.channelsService.remove(+id);
  }
}
