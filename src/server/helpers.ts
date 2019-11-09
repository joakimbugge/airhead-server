import { ExceptionFilter, NestInterceptor, PipeTransform, ValidationPipe } from '@nestjs/common';
import { EntityNotFoundExceptionFilter } from './exception-filters/EntityNotFoundExceptionFilter';
import { UserAlreadyExistsExceptionFilter } from './exception-filters/UserAlreadyExistsExceptionFilter';
import { ValidationExceptionFilter } from './exception-filters/ValidationExceptionFilter';
import { TransformInterceptor } from './interceptors/TransformInterceptor';

export function getErrorFilters(): ExceptionFilter[] {
  return [
    new EntityNotFoundExceptionFilter(),
    new UserAlreadyExistsExceptionFilter(),
    new ValidationExceptionFilter(),
  ];
}

export function getInterceptors(): NestInterceptor[] {
  return [
    new TransformInterceptor(),
  ];
}

export function getPipes(): PipeTransform[] {
  return [
    new ValidationPipe({ transform: true, whitelist: true }),
  ];
}
