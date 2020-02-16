import { ChildEntity, ManyToOne } from 'typeorm';
import { User } from '../../user/domain/User';
import { Token } from './Token';

@ChildEntity()
export class ResetPasswordToken extends Token {
  @ManyToOne(() => User, user => user.resetPasswordTokens)
  public user: User;
}
