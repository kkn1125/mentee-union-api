import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as chalk from 'chalk';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly timestamp = (format: string, is24: boolean = false) => {
    const time = new Date();
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const date = time.getDate();
    const hour = time.getHours();
    const convertHour = is24 ? hour : hour > 12 ? hour - 12 : hour;
    const minute = time.getMinutes();
    const second = time.getSeconds();
    const milliseconds = time.getMilliseconds();
    const AP = is24 ? '' : hour > 12 ? 'PM' : 'AM';

    return format.replace(/YYYY|MM|dd|HH|mm|ss|SSS|AP/g, ($1) => {
      switch ($1) {
        case 'YYYY':
          return year.toString().padStart(4, '0');
        case 'MM':
          return month.toString().padStart(2, '0');
        case 'dd':
          return date.toString().padStart(2, '0');
        case 'HH':
          return convertHour.toString().padStart(2, '0');
        case 'mm':
          return minute.toString().padStart(2, '0');
        case 'ss':
          return second.toString().padStart(2, '0');
        case 'SSS':
          return milliseconds.toString().padStart(3, '0');
        case 'AP':
          return AP;
        default:
          return $1;
      }
    });
  };
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    const timestamp = this.timestamp('AP HH:mm:ss.SSS');
    console.log(
      `🌱 [ ${chalk.grey(timestamp)} ] ${chalk.white(message)}`,
      ...optionalParams.map((_) => chalk.cyanBright(_)),
    );
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    const timestamp = this.timestamp('AP HH:mm:ss.SSS');
    console.error(
      `🚨 [ ${chalk.grey(timestamp)} ] ${chalk.red(message)}`,
      ...optionalParams.map((_) => chalk.cyanBright(_)),
    );
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    const timestamp = this.timestamp('AP HH:mm:ss.SSS');
    console.warn(
      `⚠️ [ ${chalk.grey(timestamp)} ] ${chalk.yellow(message)}`,
      ...optionalParams.map((_) => chalk.cyanBright(_)),
    );
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...optionalParams: any[]) {
    const timestamp = this.timestamp('AP HH:mm:ss.SSS');
    console.debug(
      `🐛 [ ${chalk.grey(timestamp)} ] ${chalk.blueBright(message)}`,
      ...optionalParams.map((_) => chalk.cyanBright(_)),
    );
  }

  verbose(message: any, ...optionalParams: any[]) {
    const timestamp = this.timestamp('AP HH:mm:ss.SSS');
    console.info(
      `📝 [ ${chalk.grey(timestamp)} ] ${chalk.green(message)}`,
      ...optionalParams.map((_) => chalk.cyanBright(_)),
    );
  }

  fatal(message: any, ...optionalParams: any[]) {
    const timestamp = this.timestamp('AP HH:mm:ss.SSS');
    console.error(
      `💥 [ ${chalk.grey(timestamp)} ] ${chalk.redBright(message)}`,
      ...optionalParams.map((_) => chalk.cyanBright(_)),
    );
  }

  trace(message: any, ...optionalParams: any[]) {
    const timestamp = this.timestamp('AP HH:mm:ss.SSS');
    console.trace(
      `🖇️ [ ${chalk.grey(timestamp)} ] ${chalk.blueBright(message)}`,
      ...optionalParams.map((_) => chalk.cyanBright(_)),
    );
  }
}
