import { IsNotEmpty } from 'class-validator';
import { IsEqual } from '../../../server/validation/decorators/IsEqual';

export class UpdatePasswordDto {
  @IsNotEmpty()
  public password: string;

  @IsNotEmpty()
  @IsEqual('password')
  public repeatPassword: string;
}
