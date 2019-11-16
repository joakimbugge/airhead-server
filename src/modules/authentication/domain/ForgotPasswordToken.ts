import { Entity, ManyToOne } from 'typeorm';
import { User } from '../../user/domain/User';
import { Token } from './Token';

@Entity()
export class ForgotPasswordToken extends Token {
  @ManyToOne(() => User, user => user.forgotPasswordTokens)
  public user: User;
}
