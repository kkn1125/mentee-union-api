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
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GivePointsDto } from './dto/give-points.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { LoggerService } from '@/logger/logger.service';
import { MailerService } from '@/mailer/mailer.service';
import { CheckEmailPipe } from './pipe/check-email.pipe';

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
}
