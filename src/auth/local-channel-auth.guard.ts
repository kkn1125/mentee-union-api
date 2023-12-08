import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { ApiResponseService } from '@/api-response/api-response.service';
// import { AuthGuard } from '@nestjs/passport';

export type ChannelTokenDto = {
  token: string;
  user_id: number;
};

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const channelToken = request.headers['channel-token'] as string;
    const channelUserId = +(request.headers['channel-user-id'] as string);
    const result = this.authService.verifySocketToken(
      channelToken.slice(7) || '',
    );
    if (!result) {
      ApiResponseService.UNAUTHORIZED('invalid channel token');
    } else if (isNaN(channelUserId)) {
      ApiResponseService.UNAUTHORIZED('invalid channel user id');
    } else {
      try {
        await this.authService.checkUser(channelUserId);
      } catch (error) {
        ApiResponseService.UNAUTHORIZED(error, 'not found user');
      }
    }
    console.log('check channel token', channelToken, result);
    request.channels = { token: channelToken, user_id: channelUserId };

    return result;
  }
}
