import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Request } from 'express';
// import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(private readonly channelsService: ChannelsService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const channelToken = request.headers['channel-token'] as string;
    const result = this.channelsService.verifyToken(
      channelToken.slice(7) || '',
    );
    console.log('check channel token', channelToken, result);
    request.channels = { token: channelToken };

    return result;
  }
}
