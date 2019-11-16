import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays } from 'date-fns';
import { Repository } from 'typeorm';
import * as uuid from 'uuid/v4';
import { Service } from '../../../services/Service';
import { ConfigService } from '../../config/services/ConfigService';
import { User } from '../../user/domain/User';
import { ForgotPasswordToken } from '../domain/ForgotPasswordToken';

@Injectable()
export class ForgotPasswordTokenService extends Service<ForgotPasswordToken> {
  constructor(
    @InjectRepository(ForgotPasswordToken)
    private readonly tokenRepository: Repository<ForgotPasswordToken>,
    private readonly configService: ConfigService,
  ) {
    super(tokenRepository);
  }

  public createToken(user: User): ForgotPasswordToken {
    const { FORGOT_PASSWORD_TOKEN_LIFE_TIME } = this.configService.env;
    const token = new ForgotPasswordToken();

    token.hash = uuid();
    token.expiresAt = addDays(new Date(), FORGOT_PASSWORD_TOKEN_LIFE_TIME);
    token.user = user;

    return token;
  }
}
