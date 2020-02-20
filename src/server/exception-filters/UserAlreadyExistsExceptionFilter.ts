import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { ValidationUtils } from '../../utils/ValidationUtils';
import { UserAlreadyExistsException } from '../exceptions/UserAlreadyExistsException';
import { ErrorResponse } from '../responses/ErrorResponse';

@Catch(UserAlreadyExistsException)
export class UserAlreadyExistsExceptionFilter implements ExceptionFilter {
  public catch(exception: UserAlreadyExistsException, host: ArgumentsHost): void {
    const { body } = host.switchToHttp().getRequest<Request>();

    new ErrorResponse()
      .statusCode(HttpStatus.BAD_REQUEST)
      .message([
        ValidationUtils.createError('username', body, { isNotUnique: `username may already be in use` }),
        ValidationUtils.createError('email', body, { isNotUnique: `email may already be in use` }),
      ])
      .send(host);
  }
}
