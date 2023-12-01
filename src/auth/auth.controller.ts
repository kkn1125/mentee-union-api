import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { LoggerService } from '@/logger/logger.service';
import { SigninDto } from './dto/signin.dto';
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

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('update')
  updatePassword(
    @Body('session') session: string,
    @Body('email') email: string,
    @Body('new_password') newPassword: string,
  ) {
    this.logger.debug('updateAuthDto', newPassword);

    if (session === 'auth-update') {
      return this.authService.updatePassword(email, newPassword);
    } else {
      ApiResponseService.FORBIDDEN('not allowed access');
    }
  }

  // @UseGuards(AuthGuard)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // console.log('controller profile', req.user);
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  @HttpCode(200)
  signout(@Request() req) {
    const result = this.authService.signOut(req.user.userId);
    return !!result;
  }
}
