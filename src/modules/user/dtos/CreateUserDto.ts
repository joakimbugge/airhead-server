import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public username: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  public email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public password: string;
}
