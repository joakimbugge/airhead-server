import { IsNotEmpty, IsString } from 'class-validator';

export class LoginResponseDto {
  @IsNotEmpty()
  @IsString()
  public token: string;

  constructor(token: string) {
    this.token = token;
  }
}
