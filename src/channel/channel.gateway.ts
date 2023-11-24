import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
export class ChannelGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  clients: Map<string, any> = new Map();

  constructor(private readonly channelService: ChannelService) {}

  handleConnection(client: any, ...args: any[]) {
    client['id'] = String(+new Date());
    this.clients.set(client.id, client);
  }
  handleDisconnect(client: any) {
    console.log('bye', client['id']);
    delete this.clients[client['id']];
  }

  // @WebSocketServer()
  // server = App();

  @SubscribeMessage('findAllChannel')
  findAll(client, data) {
    console.log(client);
    console.log(data);

    this.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          message: this.channelService.findAll(),
        }),
      );
    });
    // return {
    //   message: this.channelService.findAll(),
    // };
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
