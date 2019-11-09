import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ErrorResponse } from '../responses/ErrorResponse';

@Catch(ValidationError)
export class ValidationExceptionFilter implements ExceptionFilter {
  public catch(exception: ValidationError, host: ArgumentsHost): void {
    new ErrorResponse()
      .statusCode(HttpStatus.BAD_REQUEST)
      .message([exception])
      .send(host);
  }
}
