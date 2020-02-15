import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsEqual } from '../../../server/validation/decorators/IsEqual';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @ApiProperty()
  public password: string;

  @IsNotEmpty()
  @IsEqual('password')
  @ApiProperty()
  public repeatPassword: string;
}
