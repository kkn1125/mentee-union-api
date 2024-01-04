import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { ApiResponseFilter } from './api-response/api-response.filter';
import { ApiResponseInterceptor } from './api-response/api-response.interceptor';
import { ApiResponseService } from './api-response/api-response.service';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(LoggerService);
  app.useLogger(logger);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('server.port');
  const dsn = configService.get<string>('server.dns');

  /* sentry settings */
  // dsn 별도로 분리하기
  Sentry.init({
    dsn: dsn,
    integrations: [new ProfilingIntegration()],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  // const transaction = Sentry.startTransaction({
  //   op: 'test',
  //   name: 'My First Test Transaction',
  // });

  // setTimeout(() => {
  //   try {
  //     throw new Error('test error');
  //   } catch (e) {
  //     Sentry.captureException(e);
  //   } finally {
  //     transaction.finish();
  //   }
  // }, 99);

  app.setGlobalPrefix('/api', {
    exclude: [''],
  });

  app.useGlobalFilters(
    new ApiResponseFilter(app.get<ApiResponseService>(ApiResponseService)),
  );
  app.useGlobalInterceptors(
    new ApiResponseInterceptor(app.get<ApiResponseService>(ApiResponseService)),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:8080',
    ],
  });

  await app.listen(port, () => {
    logger.log(`listening on http://localhost:${port}`);
  });
}

bootstrap();
