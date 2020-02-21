import { TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../src/modules/product/services/ProductService';
import { User } from '../../../src/modules/user/domain/User';
import { TestHelpers } from '../../TestHelpers';
import { TestUtils } from '../../TestUtils';

let app: TestingModule;
let service: ProductService;
let user: User;

const persistProducts = async (names: string[]): Promise<void> => {
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < names.length; i++) {
    await TestHelpers.persistProduct(TestHelpers.createProduct(user, names[i]));
  }
};

beforeEach(async () => {
  app = await TestUtils.createApplication();
  service = app.get(ProductService);
  user = await TestHelpers.persistUser(TestHelpers.createUser());
});

afterEach(() => TestUtils.stopApplication(app));

describe('search()', () => {
  it('Find relevant products', async () => {
    await persistProducts(['Butter', 'Bread', 'Apple']);

    const searchResults = await service.search('Butt', user);

    expect(searchResults).toHaveLength(2);
    // The first product should have a high likeness
    expect(searchResults[0].likeness).toBeGreaterThan(75);
    // Should not include products with likeness below threshold
    expect(TestHelpers.getLast(searchResults).likeness).not.toBeLessThan(10);
    // Should be sorted descending by likeness
    expect(searchResults[0].likeness).toBeGreaterThan(searchResults[1].likeness);
  });

  it('Find more products', async () => {
    await persistProducts(['Butter', 'Bread', 'Apple']);

    const searchResults = await service.search('Butt', user, 0);

    // Should include more products because threshold is set to 0
    expect(searchResults).toHaveLength(3);
    // Should include products with low likeness
    expect(TestHelpers.getLast(searchResults).likeness).toBeLessThan(10);
  });
});
