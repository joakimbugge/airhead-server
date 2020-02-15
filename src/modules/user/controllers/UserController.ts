import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from 'http-status-codes';
import { ApiBadRequestException } from '../../../docs/exceptions/ApiBadRequestException';
import { ApiUnauthorizedException } from '../../../docs/exceptions/ApiUnauthorizedException';
import { Authed } from '../../../server/decorators/Authed';
import { Authenticated } from '../../../server/decorators/Authenticated';
import { HashUtils } from '../../../utils/HashUtils';
import { User } from '../domain/User';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { UserService } from '../services/UserService';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Get('/me')
  @Authenticated()
  @ApiBearerAuth()
  @ApiResponse({ status: OK, type: User })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
  public me(@Authed() user: User): User {
    return user;
  }

  @Post('/')
  @ApiResponse({ status: CREATED, type: User })
  @ApiResponse({ status: BAD_REQUEST, type: ApiBadRequestException })
  public create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { username, password, email } = createUserDto;

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = HashUtils.createHash(password);

    return this.userService.save(user);
  }
}
