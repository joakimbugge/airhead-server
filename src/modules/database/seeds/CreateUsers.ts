import { Factory, Seeder } from 'typeorm-seeding';
import { Product } from '../../product/domain/Product';
import { User } from '../../user/domain/User';

// noinspection JSUnusedGlobalSymbols
export default class CreateUsers implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(User)()
      .map(async (user: User) => {
        user.products = await factory(Product)().createMany(10);
        return user;
      })
      .createMany(5);
  }
}
