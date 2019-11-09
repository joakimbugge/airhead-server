import { HttpStatus } from '@nestjs/common';

export interface ErrorResponsePayload {
  statusCode: HttpStatus;
  message?: string;
  error: string;
}
