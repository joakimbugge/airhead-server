import { Injectable } from '@nestjs/common';
import { RequestHandler } from '@nestjs/common/interfaces';
import { format as dateFormat } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import * as morgan from 'morgan';
import { v4 as uuid } from 'uuid';
import { createLogger, format, Logger, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '../../config/services/ConfigService';
import { LogLevel } from '../enum/LogLevel';

export const DEFAULT_CONTEXT = 'Nest';

@Injectable()
export class LogService {
  private id: string;
  private readonly logger: Logger;

  public readonly Level = LogLevel;

  constructor(private readonly config: ConfigService) {
    this.logger = createLogger({
      exitOnError: false,
      format: format.combine(
        format.timestamp(),
        format.printf(info => {
          const zonedDate = utcToZonedTime(info.timestamp, 'Europe/Oslo');
          const date = dateFormat(zonedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

          return [[date, info.id, info.level.toUpperCase()].join(' - '), `[${info.context}]`, info.message].join(' ');
        }),
      ),
      transports: [
        new DailyRotateFile({
          dirname: this.config.env.LOGS_PATH,
          maxFiles: '7d',
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          filename: 'all.%DATE%.log',
        }),
        new DailyRotateFile({
          dirname: this.config.env.LOGS_PATH,
          maxFiles: '7d',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          filename: 'error.%DATE%.log',
        }),
        new transports.Console({
          level: 'debug',
          handleExceptions: true,
        }),
      ],
    });
  }

  public log(message: string, context: string = DEFAULT_CONTEXT, level: LogLevel = LogLevel.Error): void {
    this.logger.log(level, message, { id: this.id, context });
  }

  public error(message: string | Error, context?: string): void {
    if (message instanceof Error) {
      this.log(message.stack, message.constructor.name, LogLevel.Error);
    } else {
      this.log(message, context, LogLevel.Error);
    }
  }

  public warn(message: string, context?: string): void {
    this.log(message, context, LogLevel.Warning);
  }

  public info(message: string, context?: string): void {
    this.log(message, context, LogLevel.Info);
  }

  public debug(message: string, context?: string): void {
    this.log(message, context, LogLevel.Debug);
  }

  public getRequestMiddleware(): RequestHandler {
    return morgan(
      (tokens, req, res) => {
        return [tokens['remote-addr'](req, res), tokens.method(req, res), tokens.url(req, res)].join(' ');
      },
      {
        immediate: true,
        stream: this.getMorganStream('Request'),
      },
    );
  }

  public getResponseMiddleware(): RequestHandler {
    return morgan(
      (tokens, req, res) => {
        return [
          tokens['remote-addr'](req, res),
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens['response-time'](req, res),
          'ms',
        ].join(' ');
      },
      {
        stream: this.getMorganStream('Response'),
      },
    );
  }

  public getIdMiddleware(): RequestHandler {
    return (_, __, next) => {
      this.id = uuid();
      next();
    };
  }

  private getMorganStream(context: string): morgan.StreamOptions {
    return {
      write: message => {
        // Removes newline added by morgan, see https://stackoverflow.com/a/40887285/1162819
        this.info(message.substring(0, message.lastIndexOf('\n')), context);
      },
    };
  }
}
