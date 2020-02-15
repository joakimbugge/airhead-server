import { ApiProperty } from '@nestjs/swagger';

export class ApiValidationError {
  @ApiProperty({ example: 'firstName' })
  public property: string;

  @ApiProperty({
    example: {
      isString: 'Has to be a string',
      minLength: 'Has to contain at least 2 characters',
    },
  })
  public constraints: object;
}
