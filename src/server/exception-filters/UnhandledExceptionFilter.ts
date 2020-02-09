import { ArgumentsHost, Catch, HttpServer } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { LogService } from '../../modules/logging/services/LogService';

@Catch()
export class UnhandledExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly httpServer: HttpServer, private readonly logService: LogService) {
    super(httpServer);
  }

  public catch(exception: any, host: ArgumentsHost): void {
    this.logService.error(exception, 'AllExceptionsFilter');
    super.catch(exception, host);
  }
}
