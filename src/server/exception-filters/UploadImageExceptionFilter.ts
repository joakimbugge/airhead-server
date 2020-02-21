import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ValidationUtils } from '../../utils/ValidationUtils';
import { UploadImageException } from '../exceptions/UploadImageException';
import { ErrorResponse } from '../responses/ErrorResponse';

@Catch(UploadImageException)
export class UploadImageExceptionFilter implements ExceptionFilter {
  public catch(exception: UploadImageException, host: ArgumentsHost): void {
    new ErrorResponse()
      .statusCode(HttpStatus.BAD_REQUEST)
      .message([
        ValidationUtils.createError('file', {}, { file: exception.message }),
      ])
      .send(host);
  }
}
