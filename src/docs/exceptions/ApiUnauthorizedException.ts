import { ApiProperty } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';

export class ApiUnauthorizedException {
  @ApiProperty({ example: 'Unauthorized' })
  public error: string;

  @ApiProperty({ example: StatusCodes.UNAUTHORIZED })
  public statusCode: number;
}
