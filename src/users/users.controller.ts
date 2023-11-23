import { ApiResponseService } from '@/api-response/api-response.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
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
    // this.logger.debug(createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
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
  async remove(@Param('id') id: string) {
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
