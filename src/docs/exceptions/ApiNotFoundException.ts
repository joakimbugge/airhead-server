import { ApiProperty } from '@nestjs/swagger';
import { NOT_FOUND } from 'http-status-codes';

export class ApiNotFoundException {
  @ApiProperty({ example: 'Not found' })
  public error: string;

  @ApiProperty({ example: NOT_FOUND })
  public statusCode: number;

  @ApiProperty({ example: 'Cannot GET /foo' })
  public message: string;
}
