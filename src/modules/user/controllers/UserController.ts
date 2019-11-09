import { Body, Controller, Get, Post } from '@nestjs/common';
import { Authed } from '../../../server/decorators/Authed';
import { Authenticated } from '../../../server/decorators/Authenticated';
import { HashUtils } from '../../../utils/HashUtils';
import { User } from '../domain/User';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { UserService } from '../services/UserService';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Get('/me')
  @Authenticated()
  public me(@Authed() user: User): User {
    return user;
  }

  @Post('/')
  public create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { username, password, email } = createUserDto;

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = HashUtils.createHash(password);

    return this.userService.save(user);
  }
}
