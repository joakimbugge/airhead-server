import { ApiProperty } from '@nestjs/swagger';
import { BAD_REQUEST } from 'http-status-codes';
import { ApiValidationError } from './ApiValidationError';

export class ApiBadRequestException {
  @ApiProperty({ example: 'Bad request' })
  public error: string;

  @ApiProperty({ example: BAD_REQUEST })
  public statusCode: number;

  @ApiProperty({ type: [ApiValidationError] })
  public message: ApiValidationError[];
}
