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
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtCheckGuard } from './jwt-check.guard';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  @UseGuards(JwtCheckGuard)
  @Get(':type(\\w+)')
  findAllByType(@Req() req: Request, @Param('type') type: string) {
    if (req.user) {
      return this.boardsService.findAllByType(type, req.user.userId);
    } else {
      return this.boardsService.findAllByType(type);
    }
  }

  @Get(':id(\\d+)')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    await this.boardsService.updateViewCount(+id);
    return await this.boardsService.findOne(+id);
  }

  @Get(':type/:id(\\d+)')
  async findOneByTypeId(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.boardsService.updateViewCount(+id);
    return await this.boardsService.findOneByType(+id, type);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: Request,
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    createBoardDto: CreateBoardDto,
  ) {
    createBoardDto.user_id = req.user.userId;
    return this.boardsService.create(createBoardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('qna')
  createQna(
    @Req() req: Request,
    @Body(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
      }),
    )
    createBoardDto: CreateBoardDto,
  ) {
    createBoardDto.user_id = req.user.userId;
    createBoardDto.type = 'qna';
    return this.boardsService.create(createBoardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id(\\d+)')
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    const board = await this.boardsService.findOne(id);
    if (board.user_id === req.user.userId) {
      await this.boardsService.update(+id, updateBoardDto);
      return {
        message: 'success update board',
      };
    } else {
      return {
        message: 'not owner this board',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('qna/:id(\\d+)')
  async updateQna(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    const board = await this.boardsService.findOneByType(id, 'qna');
    if (board.user_id === req.user.userId) {
      await this.boardsService.update(+id, updateBoardDto);
      return {
        message: 'success update board',
      };
    } else {
      return {
        message: 'not owner this qna',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id(\\d+)')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const board = await this.boardsService.findOne(id);
    if (board.user_id === req.user.userId) {
      return this.boardsService.remove(+id);
    } else {
      return {
        message: 'not owner this board',
      };
    }
  }
}
