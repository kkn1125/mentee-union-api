import { ApiResponseService } from '@/api-response/api-response.service';
import {
  ArgumentMetadata,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { SeminarsService } from '../seminars.service';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UpdatePipe implements PipeTransform {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
    private readonly seminarsService?: SeminarsService,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;

    try {
      const existingData = await this.seminarsService
        .getRepository()
        .findOneOrFail({ where: { id: +this.request.params.id } });

      console.log({
        ...existingData,
        ...value,
      });

      return {
        ...existingData,
        ...value,
      };
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, 'not found seminar');
    }
  }
}
