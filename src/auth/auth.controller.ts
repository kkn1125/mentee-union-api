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
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { Request } from 'express';
import { ApiResponseService } from '@/api-response/api-response.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signinDto: SigninDto) {
    this.logger.debug('signinDto', signinDto);
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

  // @UseGuards(LocalAuthGuard)
  // @HttpCode(HttpStatus.OK)
  // @Post('update')
  // updatePassword(
  //   @Body('session') session: string,
  //   @Body('email') email: string,
  //   @Body('new_password') newPassword: string,
  // ) {
  //   this.logger.debug('updateAuthDto', newPassword);

  //   if (session === 'auth-update') {
  //     return this.authService.updatePassword(email, newPassword);
  //   } else {
  //     ApiResponseService.FORBIDDEN('not allowed access');
  //   }
  // }

  // @UseGuards(AuthGuard)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    // console.log('controller profile', req.user);
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
