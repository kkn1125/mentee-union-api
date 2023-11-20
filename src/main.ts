import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new ConsoleLogger('System');

  app.setGlobalPrefix('/api', {
    exclude: [''],
  });

  await app.listen(3000, () => {
    logger.log('listening on http://localhost:3000');
  });
}
bootstrap();
