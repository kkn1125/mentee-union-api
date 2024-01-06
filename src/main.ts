import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { ApiResponseFilter } from './api-response/api-response.filter';
import { ApiResponseInterceptor } from './api-response/api-response.interceptor';
import { ApiResponseService } from './api-response/api-response.service';
import { AppModule } from './app.module';
import { MODE } from './config/constants';
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

  app.setGlobalPrefix('/api', {
    exclude: [''],
  });

  app.useGlobalFilters(
    new ApiResponseFilter(
      app.get<ApiResponseService>(ApiResponseService),
      app.get<LoggerService>(LoggerService),
    ),
  );
  app.useGlobalInterceptors(
    new ApiResponseInterceptor(
      app.get<ApiResponseService>(ApiResponseService),
      app.get<LoggerService>(LoggerService),
    ),
  );

  app.enableCors({
    origin:
      MODE === 'development'
        ? [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://localhost:4173',
            'http://localhost:5173',
            'http://localhost:8080',
          ]
        : [
            'http://menteeunion.kro.kr',
            'http://port-0-mentee-union-api-28f9s2blr1oy4j2.sel5.cloudtype.app',
            'https://menteeunion.kro.kr',
            'https://port-0-mentee-union-api-28f9s2blr1oy4j2.sel5.cloudtype.app',
          ],
  });

  await app.listen(port, () => {
    logger.log(`listening on http://localhost:${port}`);
    logger.debug(`this server mode is ${MODE}`);
  });
}

bootstrap();
