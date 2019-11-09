import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '../dtos/LoginDto';
import { LoginResponseDto } from '../dtos/LoginResponseDto';
import { AuthenticationService } from '../services/AuthenticationService';

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {
  }

  @Post('login')
  public async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    const user = await this.authenticationService.authenticate(username, password);
    const token = this.authenticationService.createTokenForUser(user);
    return new LoginResponseDto(token);
  }
}
