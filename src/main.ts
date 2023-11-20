import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiResponseService } from './api-response/api-response.service';
import { ApiResponseFilter } from './api-response/api-response.filter';
import { ApiResponseInterceptor } from './api-response/api-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new ConsoleLogger('System');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('server.port');

  app.setGlobalPrefix('/api', {
    exclude: [''],
  });

  app.useGlobalFilters(
    new ApiResponseFilter(app.get<ApiResponseService>(ApiResponseService)),
  );
  app.useGlobalInterceptors(
    new ApiResponseInterceptor(app.get<ApiResponseService>(ApiResponseService)),
  );

  await app.listen(port, () => {
    logger.log(`listening on http://localhost:${port}`);
  });
}

bootstrap();
