import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    console.log(`🌱 ${message}`, ...optionalParams);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    console.error(`🚨 ${message}`, ...optionalParams);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    console.warn(`⚠️ ${message}`, ...optionalParams);
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...optionalParams: any[]) {
    console.debug(`🐛 ${message}`, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    console.info(`📝 ${message}`, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    console.error(`💥 ${message}`, ...optionalParams);
  }
}
