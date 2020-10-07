import { ApiProperty } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';

export class ApiNotFoundException {
  @ApiProperty({ example: 'Not found' })
  public error: string;

  @ApiProperty({ example: StatusCodes.NOT_FOUND })
  public statusCode: number;

  @ApiProperty({ example: 'Cannot GET /foo' })
  public message: string;
}
