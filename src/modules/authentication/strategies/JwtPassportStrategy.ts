import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../config/services/ConfigService';
import { User } from '../../user/domain/User';
import { UserService } from '../../user/services/UserService';
import { BearerToken } from '../domain/BearerToken';

type Done = (error: HttpException, user: User) => void;

@Injectable()
export class JwtPassportStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService, private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.env.SECRET,
    });
  }

  // noinspection JSUnusedGlobalSymbols
  public async validate(payload: BearerToken, done: Done): Promise<void> {
    try {
      done(null, await this.userService.find({ id: payload.id }));
    } catch (err) {
      done(new UnauthorizedException(), null);
    }
  }
}
