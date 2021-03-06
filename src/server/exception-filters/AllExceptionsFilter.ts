import { ArgumentsHost, Catch, HttpServer, NotFoundException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { BaseExceptionFilter } from '@nestjs/core';
import { LogService } from '../../modules/logging/services/LogService';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly httpServer: HttpServer, private readonly logService: LogService) {
    super(httpServer);
  }

  public catch(exception: HttpException, host: ArgumentsHost): void {
    if (!(exception instanceof NotFoundException)) {
      this.logService.error(exception);
    }

    super.catch(exception, host);
  }
}
