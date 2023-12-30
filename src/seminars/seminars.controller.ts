import { ApiResponseService } from '@/api-response/api-response.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
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
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { UpdateSeminarDto } from './dto/update-seminar.dto';
import { UpdatePipe } from './pipe/update.pipe';
import { SeminarsService } from './seminars.service';

@Controller('seminars')
export class SeminarsController {
  constructor(private readonly seminarsService: SeminarsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('cover'))
  async create(
    @Req() req: Request,
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    createSeminarDto: CreateSeminarDto,
    @UploadedFile() cover: Express.Multer.File,
  ) {
    createSeminarDto.host_id = req.user.userId;
    try {
      const seminar = await this.seminarsService.create(createSeminarDto);
      if (cover) {
        await this.seminarsService.uploadCover(seminar.id, cover);
        return await this.seminarsService.findOne(seminar.id);
      } else {
        return seminar;
      }
    } catch (error) {
      ApiResponseService.BAD_REQUEST(error, 'fail create seminar');
    }
  }

  @Get('cover/:filename')
  getCover(
    @Res({ passthrough: true }) res: Response,
    @Param('filename') filename: string,
  ) {
    const cover = this.seminarsService.getCoverImage(filename);
    res.contentType(`image/${filename.split('.')[1]}`);
    res.send(cover);
  }

  @Get()
  findAll() {
    return this.seminarsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('participants')
  findInvolvedSeminars(@Req() req: Request) {
    return this.seminarsService.findInvolvedSeminars(req.user.userId);
  }

  @Get(':id(\\d+)')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    await this.seminarsService.updateViewCount(+id);
    return await this.seminarsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id(\\d+)')
  @UseInterceptors(FileInterceptor('cover'))
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body(
      UpdatePipe,
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    updateSeminarDto: UpdateSeminarDto,
    @UploadedFile() cover: Express.Multer.File,
  ) {
    //@ts-ignore
    const { coverField, ...convertUpdateSeminarDto } = updateSeminarDto;
    console.log(convertUpdateSeminarDto);
    const seminar = await this.seminarsService.findOne(id);
    if (seminar.host_id === req.user.userId) {
      await this.seminarsService.update(+id, convertUpdateSeminarDto);

      if (cover) {
        await this.seminarsService.uploadCover(+id, cover);
      }

      return ApiResponseService.SUCCESS('success update seminar');
    } else {
      ApiResponseService.BAD_REQUEST('fail update seminar', [+id]);
    }
  }

  @Delete(':id(\\d+)')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.seminarsService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  async joinSeminar(
    @Req() req: Request,
    @Body('seminar_id', ParseIntPipe) seminar_id: number,
  ) {
    const isExists = await this.seminarsService.isExistsRevertedParticipants(
      seminar_id,
      req.user.userId,
    );
    /* 이미 신청한 후 취소한 이력이 있으면 다시 되살려서 신청처리 */
    if (isExists && isExists.deleted_at !== null) {
      await this.seminarsService.restoreJoinSeminar(isExists);
      // ApiResponseService.SUCCESS('success restore exists seminar participants');
      return {
        message: 'success restore exists seminar participants',
      };
    } else {
      await this.seminarsService.joinSeminar(seminar_id, req.user.userId);
      // ApiResponseService.SUCCESS('success join seminar');
      return {
        message: 'success join seminar',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  async confirmJoinSeminar(
    @Req() req: Request,
    @Body('seminar_id', ParseIntPipe) seminar_id,
  ) {
    const result = await this.seminarsService.confirmJoinSeminar(
      seminar_id,
      req.user.userId,
    );
    if (result) {
      ApiResponseService.SUCCESS('success confirm join seminar');
    } else {
      ApiResponseService.BAD_REQUEST('already confirmed');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('cover'))
  async uploadCover(
    @Req() req: Request,
    @Body('seminar_id', ParseIntPipe) seminar_id: number,
    @UploadedFile() cover: Express.Multer.File,
  ) {
    const seminar = await this.seminarsService.findOne(seminar_id);
    if (seminar.host_id === req.user.userId) {
      if (cover) {
        await this.seminarsService.uploadCover(seminar_id, cover);
      }
    } else {
      ApiResponseService.BAD_REQUEST('not owner this seminar', req.user.userId);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cancel')
  async cancelJoinSeminar(
    @Req() req: Request,
    @Body('seminar_id', ParseIntPipe) seminar_id: number,
  ) {
    await this.seminarsService.cancelJoinSeminar(seminar_id, req.user.userId);
    // ApiResponseService.SUCCESS('success cancel join seminar');
    return {
      message: 'success cancel join seminar',
    };
  }
}
