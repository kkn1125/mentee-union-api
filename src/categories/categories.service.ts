import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseService } from '@/api-response/api-response.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  findAll() {
    return this.categoryRepository.find({
      relations: {
        mentoringSessions: true,
        seminars: true,
      },
    });
  }

  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOneOrFail({
        where: { id },
        relations: {
          mentoringSessions: true,
          seminars: true,
        },
      });
      return category;
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, 'not found category', id);
    }
  }

  async findOneByValue(value: string) {
    try {
      const category = await this.categoryRepository.findOneOrFail({
        where: { name: value },
        relations: {
          mentoringSessions: true,
          seminars: true,
        },
      });
      return category;
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, 'not found category value', value);
    }
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const qr = this.categoryRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const dto = await this.categoryRepository.save(createCategoryDto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail create category');
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const qr = this.categoryRepository.manager.connection.createQueryRunner();

    await this.findOne(id);

    await qr.startTransaction();

    try {
      const dto = await this.categoryRepository.update(id, updateCategoryDto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail update category');
    }
  }

  async softRemove(id: number) {
    const qr = this.categoryRepository.manager.connection.createQueryRunner();

    await this.findOne(id);

    await qr.startTransaction();

    try {
      const dto = await this.categoryRepository.softDelete({ id });
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail update category');
    }
  }

  async remove(id: number) {
    const qr = this.categoryRepository.manager.connection.createQueryRunner();

    await this.findOne(id);

    await qr.startTransaction();

    try {
      const dto = await this.categoryRepository.delete({ id });
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail update category');
    }
  }
}
