import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginResponseDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public token: string;

  constructor(token: string) {
    this.token = token;
  }
}
