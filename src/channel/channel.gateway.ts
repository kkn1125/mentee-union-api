import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import WebSocket from 'ws';

@WebSocketGateway({
  path: '/channel',
})
export class ChannelGateway {
  constructor(private readonly channelService: ChannelService) {}

  // @WebSocketServer()
  // server = App();

  @SubscribeMessage('findAllChannel')
  findAll() {
    // console.log(this);
    // console.log('test');
    return {
      message: this.channelService.findAll(),
    };
  }

  @SubscribeMessage('findOneChannel')
  findOne(@MessageBody() id: number) {
    return this.channelService.findOne(id);
  }

  @SubscribeMessage('createChannel')
  create(@MessageBody() createChannelDto: CreateChannelDto) {
    return this.channelService.create(createChannelDto);
  }

  @SubscribeMessage('updateChannel')
  update(@MessageBody() updateChannelDto: UpdateChannelDto) {
    return this.channelService.update(updateChannelDto.id, updateChannelDto);
  }

  @SubscribeMessage('removeChannel')
  remove(@MessageBody() id: number) {
    return this.channelService.remove(id);
  }
}
