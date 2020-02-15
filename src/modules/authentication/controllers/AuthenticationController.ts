import { Body, Controller, Param, Post, Put, Res } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BAD_REQUEST, CREATED, NO_CONTENT } from 'http-status-codes';
import { MoreThanOrEqual } from 'typeorm';
import { ApiBadRequestException } from '../../../../doc/exceptions/ApiBadRequestException';
import { DateUtils } from '../../../utils/DateUtils';
import { HashUtils } from '../../../utils/HashUtils';
import { UserService } from '../../user/services/UserService';
import { ForgotPasswordDto } from '../dtos/ForgotPasswordDto';
import { LoginDto } from '../dtos/LoginDto';
import { LoginResponseDto } from '../dtos/LoginResponseDto';
import { UpdatePasswordDto } from '../dtos/UpdatePasswordDto';
import { AuthenticationService } from '../services/AuthenticationService';
import { ForgotPasswordTokenService } from '../services/ForgotPasswordTokenService';

@Controller()
@ApiTags('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UserService,
    private readonly tokenService: ForgotPasswordTokenService,
  ) {
  }

  @Post('login')
  @ApiResponse({ status: CREATED, type: LoginResponseDto })
  @ApiResponse({ status: BAD_REQUEST, type: ApiBadRequestException })
  public async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    const user = await this.authenticationService.authenticate(username, password);
    const token = this.authenticationService.createTokenForUser(user);
    return new LoginResponseDto(token);
  }

  @Post('forgot-password')
  @ApiResponse({ status: CREATED })
  @ApiResponse({ status: BAD_REQUEST, type: ApiBadRequestException })
  public async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() response: Response,
  ): Promise<void> {
    const { email } = forgotPasswordDto;
    const user = await this.userService.find({ email });

    if (!user) {
      // Successful response to prevent user look-up
      response.status(CREATED).send();
      return;
    }

    // Clean up unused tokens
    const tokens = await this.tokenService.findMany({ user });
    await this.tokenService.deleteMany(tokens, false);

    const token = this.tokenService.createToken(user);
    await this.tokenService.save(token);

    response.status(CREATED).send();
  }

  @Put('forgot-password/:hash')
  @ApiResponse({ status: NO_CONTENT })
  @ApiResponse({ status: BAD_REQUEST, type: ApiBadRequestException })
  public async updatePassword(
    @Param('hash') hash: string,
    @Body() updatePassword: UpdatePasswordDto,
    @Res() response: Response,
  ): Promise<void> {
    const { password } = updatePassword;

    const token = await this.tokenService.find({
      hash,
      expiresAt: MoreThanOrEqual(DateUtils.format(new Date())),
    }, {
      relations: ['user'],
    });

    if (!token) {
      // Successful response to prevent user look-up
      response.status(NO_CONTENT).send();
      return;
    }

    const { user } = token;
    user.password = HashUtils.createHash(password);

    await this.userService.save(user);
    await this.tokenService.delete(token, false);

    response.status(NO_CONTENT).send();
  }
}
