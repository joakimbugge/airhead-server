import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request } from 'express';
import { CreateUserDto } from '../../modules/user/dtos/CreateUserDto';
import { UserAlreadyExistsError } from '../errors/UserAlreadyExistsError';
import { ErrorResponse } from '../responses/ErrorResponse';

const createValidationError = (property: string, target: CreateUserDto) => {
  const error = new ValidationError();
  error.property = property;
  error.children = [];
  error.target = target;
  error.constraints = { isNotUnique: `${property} may already be in use` };

  return error;
};

@Catch(UserAlreadyExistsError)
export class UserAlreadyExistsExceptionFilter implements ExceptionFilter {
  public catch(exception: UserAlreadyExistsError, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<Request>();
    const payload: CreateUserDto = request.body;

    new ErrorResponse()
      .statusCode(HttpStatus.BAD_REQUEST)
      .message([
        createValidationError('username', payload),
        createValidationError('email', payload),
      ])
      .send(host);
  }
}
