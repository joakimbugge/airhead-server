import { ApiProperty } from '@nestjs/swagger';
import { Constraints } from '../../utils/ValidationUtils';

export class ApiValidationError {
  @ApiProperty({ example: 'firstName' })
  public property: string;

  @ApiProperty({
    example: {
      isString: 'Has to be a string',
      minLength: 'Has to contain at least 2 characters',
    },
  })
  public constraints: Constraints;
}
