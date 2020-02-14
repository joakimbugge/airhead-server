import { ApiProperty } from '@nestjs/swagger';
import { UNAUTHORIZED } from 'http-status-codes';

export class ApiUnauthorizedException {
  @ApiProperty({ example: 'Unauthorized' })
  public error: string;

  @ApiProperty({ example: UNAUTHORIZED })
  public statusCode: number;
}
