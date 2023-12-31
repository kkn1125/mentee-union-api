import { ApiResponseService } from '@/api-response/api-response.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { SocketAuthGuard } from '@/auth/local-channel-auth.guard';
import { LoggerService } from '@/logger/logger.service';
import { MailerService } from '@/mailer/mailer.service';
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
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { GivePointsDto } from './dto/give-points.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckEmailPipe } from './pipe/check-email.pipe';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id(\\d+)')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(+id);
  }

  @Get('profile/resource/:filename')
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
  async findOneProfile(@Req() req: Request) {
    const user = await this.usersService.findOneProfile(req.user.userId);
    if (user) {
      return user;
    } else {
      ApiResponseService.NOT_FOUND('not found user', 'invalid token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/seminars')
  async findOneSeminars(@Req() req: Request) {
    const user = await this.usersService.findOneSeminars(req.user.userId);
    if (user) {
      return user;
    } else {
      ApiResponseService.NOT_FOUND('not found user', 'invalid token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/forums')
  async findOneForums(@Req() req: Request) {
    const user = await this.usersService.findOneForums(req.user.userId);
    if (user) {
      return user;
    } else {
      ApiResponseService.NOT_FOUND('not found user', 'invalid token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/points')
  async findOnePointSystem(@Req() req: Request) {
    const user = await this.usersService.findOnePointSystem(req.user.userId);
    if (user) {
      return user;
    } else {
      ApiResponseService.NOT_FOUND('not found user', 'invalid token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/mentorings')
  async findOneMentorings(@Req() req: Request) {
    const user = await this.usersService.findOneMentorings(req.user.userId);
    if (user) {
      return user;
    } else {
      ApiResponseService.NOT_FOUND('not found user', 'invalid token');
    }
  }

  @UseGuards(SocketAuthGuard)
  @Get('socket/profile')
  async findOneSocketProfile(@Req() req: Request) {
    const userId = +req.channels.user_id;
    if (!userId) {
      ApiResponseService.BAD_REQUEST('invalid header');
    } else {
      const user = await this.usersService.findOneProfile(userId);
      if (user) {
        return user;
      } else {
        ApiResponseService.NOT_FOUND('not found user', 'invalid token');
      }
    }
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
    this.loggerService.debug(createUserDto);
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
    this.loggerService.log('profile', profile);
    await this.usersService.updateProfile(req.user.userId, profile);
    return ApiResponseService.SUCCESS('success');
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

  @UseGuards(JwtAuthGuard)
  @Delete('')
  async softRemove(@Req() req: Request) {
    await this.usersService.softRemove(req.user.userId);
    ApiResponseService.SUCCESS('success soft delete');
  }

  @Delete(':id(\\d+)')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(+id);
    ApiResponseService.SUCCESS('success delete');
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

  @UseGuards(JwtAuthGuard)
  @Post('points/already')
  async userPointsAlready(
    @Req() req: Request,
    @Body('receiver_id', ParseIntPipe) receiver_id: number,
  ) {
    const isGiverSameReceiver = this.usersService.isGiverReceiver(
      req.user.userId,
      receiver_id,
    );

    const giver = await this.usersService.findOne(req.user.userId);
    const receiver = await this.usersService.findOne(receiver_id);

    const notFoundList: number[] = [];

    if (!giver) {
      notFoundList.push(req.user.userId);
    }

    if (!receiver) {
      notFoundList.push(receiver_id);
    }

    if (notFoundList.length > 0) {
      ApiResponseService.NOT_FOUND('not found receiver', notFoundList);
    }

    if (isGiverSameReceiver) {
      ApiResponseService.CONFLICT('duplicated giver as receiver', [
        req.user.userId,
        receiver_id,
      ]);
    } else {
      return await this.usersService.checkAlreadyPointGived(
        req.user.userId,
        receiver_id,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('points')
  async userPointsAsJwt(
    @Req() req: Request,
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    givePointsDto: GivePointsDto,
  ) {
    givePointsDto.giver_id = req.user.userId;

    const giver = await this.usersService.findOne(req.user.userId);
    const receiver = await this.usersService.findOne(givePointsDto.receiver_id);

    const notFoundList: number[] = [];

    if (!giver) {
      notFoundList.push(req.user.userId);
    }

    if (!receiver) {
      notFoundList.push(givePointsDto.receiver_id);
    }

    if (notFoundList.length > 0) {
      /* 사용자 찾지 못할 때 */
      ApiResponseService.NOT_FOUND('not found user', notFoundList);
    }

    if (giver.id === receiver.id) {
      /* 추천자와 추천인이 동일할 때 */
      ApiResponseService.BAD_REQUEST('do not give point to self');
    } else {
      const result = await this.usersService.givePoints(givePointsDto);

      const isPossibleUpgradeReceiver =
        await this.usersService.isPossibleUpgrade(receiver.id);
      const isPossibleUpgradeGiver = await this.usersService.isPossibleUpgrade(
        giver.id,
      );

      if (isPossibleUpgradeReceiver) {
        const upgraded = await this.usersService.upgradeUser(receiver.id);
        if (upgraded === null) {
          ApiResponseService.BAD_REQUEST('fail upgrade', receiver.id);
        } else {
          this.loggerService.log('upgraded receiver id:', receiver.id);
        }
      }

      if (isPossibleUpgradeGiver) {
        const upgraded = await this.usersService.upgradeUser(giver.id);
        if (upgraded === null) {
          ApiResponseService.BAD_REQUEST('fail upgrade', giver.id);
        } else {
          this.loggerService.log('upgraded giver id:', receiver.id);
        }
      }

      if (result === null) {
        ApiResponseService.BAD_REQUEST('not allowed recommend same person');
      } else {
        ApiResponseService.SUCCESS('success give points to receiver');
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('dormant')
  async restore(
    @Req() req: Request,
    @Body('email', CheckEmailPipe) email: string,
  ) {
    if (req.user.email !== email) {
      ApiResponseService.UNAUTHORIZED('access denied', email);
    } else {
      const flag = await this.mailerService.sendAuthMail(email);
      if (flag === 'success') {
        await this.usersService.restoreDormantAccount(email);
        ApiResponseService.SUCCESS('success restore dormant account');
      } else {
        ApiResponseService.BAD_REQUEST(flag);
      }
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
