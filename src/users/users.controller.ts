import { ApiResponseService } from '@/api-response/api-response.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GivePointsDto } from './dto/give-points.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { LoggerService } from '@/logger/logger.service';
import { MailerService } from '@/mailer/mailer.service';
import { CheckEmailPipe } from './pipe/check-email.pipe';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id(\\d+)')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(+id);
  }

  @Get('profile/:filename')
  getFilename(
    @Res({ passthrough: true }) res: Response,
    @Param('filename') filename: string,
  ) {
    const file = this.usersService.getProfileImage(filename);
    res.contentType(`image/${filename.split('.')[1]}`);
    res.send(file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  findOneProfile(@Req() req: Request) {
    return this.usersService.findOneProfile(req.user.userId);
  }

  @Post('check/username')
  async checkAlreadyUsedUsername(@Body('username') username: string) {
    const result = !(await this.usersService.findOneByUsername(username));
    if (result) {
      ApiResponseService.SUCCESS('available username');
    } else {
      ApiResponseService.CONFLICT('duplicated', username);
    }
  }

  @Post('check/email')
  async checkAlreadyUsedEmail(@Body('email') email: string) {
    const result = !(await this.usersService.findOneByEmail(email));
    if (result) {
      ApiResponseService.SUCCESS('available email');
    } else {
      ApiResponseService.CONFLICT('duplicated', email);
    }
  }

  @Post()
  create(
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    createUserDto: CreateUserDto,
  ) {
    this.logger.debug(createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Put('reset')
  async resetPassword(
    @Body('token') token: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const result = this.mailerService.resetMailMapDeleteByEmail(email, token);
    if (result === 'success') {
      await this.usersService.resetPassword(email, password);
      ApiResponseService.SUCCESS('success reset password');
    } else if (result === 'token expired') {
      ApiResponseService.BAD_REQUEST('access denied', 'token expired');
    } else if (result === 'not matched token') {
      ApiResponseService.BAD_REQUEST('access denied', 'wrong token');
    } else {
      ApiResponseService.BAD_REQUEST('access denied', 'no exists session');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @UseInterceptors(FileInterceptor('profile'))
  async updateProfile(
    @Req() req: Request,
    @UploadedFile() profile: Express.Multer.File,
  ) {
    console.log('profile', profile);
    await this.usersService.updateProfile(req.user.userId, profile);
    return ApiResponseService.SUCCESS('success');
    // ApiResponseService.BAD_REQUEST('access denied', 'no exists session');
  }

  @Put(':id(\\d+)')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.update(+id, updateUserDto);
    ApiResponseService.SUCCESS('success');
  }

  @Delete(':id(\\d+)')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.softRemove(+id);
    ApiResponseService.SUCCESS('success');
  }

  @Post('user-points')
  userPoints(
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    givePointsDto: GivePointsDto,
  ) {
    return this.usersService.givePoints(givePointsDto);
  }

  @Delete('dormant')
  async restore(@Body('email', CheckEmailPipe) email: string) {
    // console.log('email', email);
    const flag = await this.mailerService.sendAuthMail(email);
    // console.log(flag);
    if (flag === 'success') {
      await this.usersService.restoreDormantAccount(email);
      ApiResponseService.SUCCESS('success restore dormant account');
    } else {
      ApiResponseService.BAD_REQUEST(flag);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteProfile(@Req() req: Request) {
    const result = await this.usersService.deleteProfile(req.user.userId);
    if (result) {
      ApiResponseService.SUCCESS('success restore dormant account');
    } else {
      ApiResponseService.BAD_REQUEST('bad request');
    }
  }
}
