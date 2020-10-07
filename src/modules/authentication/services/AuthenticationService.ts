import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { HashUtils } from '../../../utils/HashUtils';
import { ConfigService } from '../../config/services/ConfigService';
import { User } from '../../user/domain/User';
import { UserService } from '../../user/services/UserService';
import { BearerToken } from '../domain/BearerToken';
import { VerifiedBearerToken } from '../domain/VerifiedBearerToken';

@Injectable()
export class AuthenticationService {
  private readonly THREE_HOURS = 3 * 2400;

  constructor(private readonly userService: UserService, private readonly configService: ConfigService) {}

  public async authenticate(username: string, password: string): Promise<User> {
    let user: User;

    try {
      user = await this.userService.get({ username });
    } catch (err) {
      throw new UnauthorizedException();
    }

    if (!HashUtils.verifyHash(password, user.password)) {
      throw new UnauthorizedException();
    }

    return user;
  }

  public createTokenForUser(user: User): string {
    const expiresIn = this.configService.env.AUTH_DURATION;
    const bearerToken = new BearerToken(user.id);
    return this.createToken(bearerToken, { expiresIn });
  }

  public createToken(bearerToken: BearerToken, options?: SignOptions): string {
    const opts: SignOptions = { expiresIn: this.THREE_HOURS, ...options };
    return jwt.sign({ id: bearerToken.id }, this.configService.env.SECRET, opts);
  }

  public verifyToken(token: string): VerifiedBearerToken {
    return plainToClass(VerifiedBearerToken, jwt.verify(token, this.configService.env.SECRET));
  }
}
