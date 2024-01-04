import { ApiResponseService } from '@/api-response/api-response.service';
import { LoggerService } from '@/logger/logger.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { SocketAuthGuard } from './local-channel-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signinDto: SigninDto) {
    this.loggerService.debug('signinDto', signinDto);
    return this.authService.signIn(signinDto.email, signinDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request) {
    try {
      await this.authService.checkUser(req.user.userId);
      return this.authService.refreshSign(req.user.email);
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, 'user not found');
    }
  }

  @Post('socket/token')
  provideToken() {
    return this.authService.provideSocketToken();
  }

  @UseGuards(SocketAuthGuard)
  @Get('socket/verify')
  verifyToken(@Req() req: Request) {
    return this.authService.verifySocketToken(req.channels.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    try {
      await this.authService.checkUser(req.user.userId);
      return req.user;
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, 'user not found');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  @HttpCode(200)
  signout(@Req() req: Request) {
    const result = this.authService.signOut(req.user.userId);
    return !!result;
  }
}
