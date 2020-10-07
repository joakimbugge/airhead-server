import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { ErrorResponse } from '../responses/ErrorResponse';

@Catch(EntityNotFoundError)
export class EntityNotFoundExceptionFilter implements ExceptionFilter {
  public catch(exception: EntityNotFoundError, host: ArgumentsHost): void {
    new ErrorResponse().statusCode(HttpStatus.NOT_FOUND).send(host);
  }
}
