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
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { ForumsService } from './forums.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Get()
  findAll() {
    return this.forumsService.findAll();
  }

  @Get(':id(\\d+)')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.forumsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: Request,
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    createForumDto: Omit<CreateForumDto, 'user_id'>,
  ) {
    try {
      const forum = await this.forumsService.create({
        ...createForumDto,
        user_id: req.user.userId,
      });
      // ApiResponseService.SUCCESS('success create forum');
      return {
        message: 'success create forum',
        details: [forum],
      };
    } catch (error) {
      ApiResponseService.BAD_REQUEST(error, 'failed create forum', [
        req.user.userId,
      ]);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('like')
  async likeForum(
    @Req() req: Request,
    @Body('forum_id', ParseIntPipe)
    forum_id: number,
  ) {
    try {
      await this.forumsService.likeForum(forum_id, req.user.userId);
      const forum = await this.forumsService.findOne(forum_id);
      // ApiResponseService.SUCCESS('success create forum');
      return {
        message: 'success like forum',
        details: forum.forumLikes.length,
      };
    } catch (error) {
      ApiResponseService.BAD_REQUEST(error, 'failed create forum', [
        req.user.userId,
      ]);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('revert')
  async revert(
    @Req() req: Request,
    @Body('id', ParseIntPipe)
    id: number,
  ) {
    const forum = await this.forumsService.findOne(id);
    if (forum.user_id === req.user.userId) {
      await this.forumsService.restore(id);
      // ApiResponseService.SUCCESS();
      return {
        message: 'success restore forum',
      };
    } else {
      ApiResponseService.BAD_REQUEST('not owner this forum', [req.user.userId]);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id(\\d+)')
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    updateForumDto: UpdateForumDto,
  ) {
    const forum = await this.forumsService.findOne(id);
    if (forum.user_id === req.user.userId) {
      await this.forumsService.update(+id, {
        ...updateForumDto,
        user_id: req.user.userId,
      });
      // ApiResponseService.SUCCESS('success update forum');
      return {
        message: 'success update forum',
      };
    } else {
      ApiResponseService.BAD_REQUEST('not owner this forum', [req.user.userId]);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id(\\d+)')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const forum = await this.forumsService.findOne(id);
    if (forum.user_id === req.user.userId) {
      await this.forumsService.softDelete(id);
      ApiResponseService.SUCCESS('success delete forum');
      return {
        message: 'success delete forum',
      };
    } else {
      ApiResponseService.BAD_REQUEST('not owner this forum', [req.user.userId]);
    }
  }
}
