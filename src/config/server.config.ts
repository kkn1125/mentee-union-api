import { registerAs } from '@nestjs/config';

export default registerAs('server', () => ({
  host: process.env.HOST,
  port: process.env.PORT || 8080,
  dsn: process.env.SENTRY_DSN,
}));
