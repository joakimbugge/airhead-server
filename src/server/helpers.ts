import { ExceptionFilter, HttpServer, NestInterceptor, PipeTransform, ValidationPipe } from '@nestjs/common';
import { LogService } from '../modules/logging/services/LogService';
import { AllExceptionsFilter } from './exception-filters/AllExceptionsFilter';
import { EntityNotFoundExceptionFilter } from './exception-filters/EntityNotFoundExceptionFilter';
import { UploadImageExceptionFilter } from './exception-filters/UploadImageExceptionFilter';
import { UserAlreadyExistsExceptionFilter } from './exception-filters/UserAlreadyExistsExceptionFilter';
import { ValidationExceptionFilter } from './exception-filters/ValidationExceptionFilter';
import { TransformInterceptor } from './interceptors/TransformInterceptor';

export function getExceptionFilters(httpServer: HttpServer, logService: LogService): ExceptionFilter[] {
  return [
    new AllExceptionsFilter(httpServer, logService),
    new EntityNotFoundExceptionFilter(),
    new UserAlreadyExistsExceptionFilter(),
    new ValidationExceptionFilter(),
    new UploadImageExceptionFilter(),
  ];
}

export function getInterceptors(): NestInterceptor[] {
  return [new TransformInterceptor()];
}

export function getPipes(): PipeTransform[] {
  return [new ValidationPipe({ transform: true, whitelist: true })];
}
