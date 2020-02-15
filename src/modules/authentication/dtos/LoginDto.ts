import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public password: string;
}
