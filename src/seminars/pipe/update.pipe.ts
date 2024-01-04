import { ApiResponseService } from '@/api-response/api-response.service';
import { LoggerService } from '@/logger/logger.service';
import {
  ArgumentMetadata,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { SeminarsService } from '../seminars.service';

@Injectable()
export class UpdatePipe implements PipeTransform {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
    private readonly loggerService: LoggerService,
    private readonly seminarsService?: SeminarsService,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;

    try {
      const existingData = await this.seminarsService
        .getRepository()
        .findOneOrFail({ where: { id: +this.request.params.id } });

      this.loggerService.log({
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
