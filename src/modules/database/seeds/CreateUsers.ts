import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Product } from '../../product/domain/Product';
import { User } from '../../user/domain/User';

// noinspection JSUnusedGlobalSymbols
export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await factory(User)().map(async (user: User) => {
      user.products = await factory(Product)().seedMany(2);
      return user;
    }).seedMany(5);
  }
}
