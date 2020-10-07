import { Body, Controller, Param, Post, Put, Res } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MoreThanOrEqual } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { ApiBadRequestException } from '../../../docs/exceptions/ApiBadRequestException';
import { DateUtils } from '../../../utils/DateUtils';
import { HashUtils } from '../../../utils/HashUtils';
import { ConfigService } from '../../config/services/ConfigService';
import { LogService } from '../../logging/services/LogService';
import { UserService } from '../../user/services/UserService';
import { ResetPasswordToken } from '../domain/ResetPasswordToken';
import { LoginDto } from '../dtos/LoginDto';
import { LoginResponseDto } from '../dtos/LoginResponseDto';
import { ResetPasswordDto } from '../dtos/ResetPasswordDto';
import { UpdatePasswordDto } from '../dtos/UpdatePasswordDto';
import { AuthenticationService } from '../services/AuthenticationService';
import { ResetPasswordService } from '../services/ResetPasswordService';

@Controller()
@ApiTags('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UserService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly config: ConfigService,
    private readonly logService: LogService,
  ) {}

  @Post('login')
  @ApiResponse({ status: StatusCodes.CREATED, type: LoginResponseDto })
  @ApiResponse({ status: StatusCodes.BAD_REQUEST, type: ApiBadRequestException })
  public async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    const user = await this.authenticationService.authenticate(username, password);
    const token = this.authenticationService.createTokenForUser(user);
    return new LoginResponseDto(token);
  }

  @Post('reset-password')
  @ApiResponse({ status: StatusCodes.CREATED })
  @ApiResponse({ status: StatusCodes.BAD_REQUEST, type: ApiBadRequestException })
  public async forgotPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() response: Response): Promise<void> {
    const { email } = resetPasswordDto;
    const { RESET_PASSWORD_TOKEN_HOURS_LIFETIME } = this.config.env;
    const user = await this.userService.find({ email });

    if (!user) {
      // Successful response to prevent user look-up
      this.logService.error(`Failed to create token for unknown email ${email}`, this.constructor.name);
      response.status(StatusCodes.CREATED).send();
      return;
    }

    const token = new ResetPasswordToken();
    token.hash = uuid();
    token.user = user;
    token.expiresAt = DateUtils.addHours(RESET_PASSWORD_TOKEN_HOURS_LIFETIME);

    await this.resetPasswordService.save(token);

    response.status(StatusCodes.CREATED).send();
  }

  @Put('reset-password/:hash')
  @ApiResponse({ status: StatusCodes.NO_CONTENT })
  @ApiResponse({ status: StatusCodes.BAD_REQUEST, type: ApiBadRequestException })
  public async updatePassword(
    @Param('hash') hash: string,
    @Body() updatePassword: UpdatePasswordDto,
    @Res() response: Response,
  ): Promise<void> {
    const { password } = updatePassword;

    const token = await this.resetPasswordService.find(
      {
        hash,
        expiresAt: MoreThanOrEqual(DateUtils.format(new Date())),
      },
      {
        relations: ['user'],
      },
    );

    if (!token) {
      // Successful response to prevent token look-up
      this.logService.error(`No token found for hash ${hash}`, this.constructor.name);
      response.status(StatusCodes.NO_CONTENT).send();
      return;
    }

    const { user } = token;
    user.password = HashUtils.createHash(password);

    await this.userService.save(user);
    await this.resetPasswordService.delete(token, false);

    response.status(StatusCodes.NO_CONTENT).send();
  }
}
