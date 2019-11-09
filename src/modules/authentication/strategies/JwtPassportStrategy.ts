import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../config/services/ConfigService';
import { UserService } from '../../user/services/UserService';
import { BearerToken } from '../domain/BearerToken';

@Injectable()
export class JwtPassportStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService,
              private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.env.SECRET,
    });
  }

  // noinspection JSUnusedGlobalSymbols
  public async validate(payload: BearerToken, done: any) {
    try {
      done(null, await this.userService.findById(payload.id));
    } catch (err) {
      done(new UnauthorizedException(), false);
    }
  }
}
