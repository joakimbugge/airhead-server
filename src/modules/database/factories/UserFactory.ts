import { define } from 'typeorm-seeding';
import { HashUtils } from '../../../utils/HashUtils';
import { User } from '../../user/domain/User';

define(User, () => {
  const user = new User();

  user.username = 'Test';
  user.password = HashUtils.createHash('123');
  user.email = 'joakim.bugge@gmail.com';

  return user;
});
