import { define } from 'typeorm-seeding';
import { HashUtils } from '../../../utils/HashUtils';
import { User } from '../../user/domain/User';
import FakerStatic = Faker.FakerStatic;

define(User, (faker: FakerStatic) => {
  const user = new User();

  user.username = faker.internet.userName();
  user.password = HashUtils.createHash('123');
  user.email = `${user.username}@example.com`;

  return user;
});
