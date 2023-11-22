import { ApiResponseService } from '@/api-response/api-response.service';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { SeminarsService } from '../seminars.service';

@Injectable()
export class UpdatePipe implements PipeTransform {
  constructor(private readonly seminarsService?: SeminarsService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    console.log(metadata);
    if (metadata.type !== 'body') return value;

    const existingData = await this.seminarsService.findOne(value.id);
    if (!existingData) ApiResponseService.NOT_FOUND('not found seminar');

    console.log({
      ...existingData,
      ...value,
    });

    return {
      ...existingData,
      ...value,
    };
  }
}
