import { TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { getRepository } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { Product } from '../../../src/modules/product/domain/Product';
import { ProductService } from '../../../src/modules/product/services/ProductService';
import { User } from '../../../src/modules/user/domain/User';
import { TestUtils } from '../../TestUtils';

let app: TestingModule;
let service: ProductService;
let user: User;

const persistProduct = (name: string = faker.commerce.productName()): Promise<Product> =>
  getRepository(Product).save(TestUtils.createProduct(name, user));

const persistProducts = async (products: Product[]): Promise<void> => {
  for (const product of products) {
    await getRepository(Product).save(product);
  }
};

beforeEach(async () => {
  app = await TestUtils.createModule();
  service = app.get<ProductService>(ProductService);
  user = await getRepository(User).save(TestUtils.createUser('Lisa'));
});

afterEach(() => TestUtils.shutdown(app));

describe('save()', () => {
  test('Returns reference to original', async () => {
    const product = TestUtils.createProduct('Milk', user);
    const savedProduct = await service.save(product);

    expect(product).toBe(savedProduct);
  });

  test('Saves to database', async () => {
    const savedProduct = await service.save(TestUtils.createProduct('Milk', user));
    const fetchedProduct = await getRepository(Product).findOne({ id: savedProduct.id });

    expect(fetchedProduct).not.toBeUndefined();
    expect(fetchedProduct.id).toEqual(savedProduct.id);
  });

  test('Updates in database', async () => {
    const product = TestUtils.createProduct('Milk', user);
    const savedProduct = { ...await service.save(product) };

    product.name = 'berries';
    await service.save(product);
    const fetchedProduct = getRepository(Product).findOne({ id: savedProduct.id });

    expect(fetchedProduct).not.toEqual(savedProduct);
  });
});

describe('findMany()', () => {
  test('Finds many products', async () => {
    const products = [
      TestUtils.createProduct('Butter', user),
      TestUtils.createProduct('Bread', user),
      TestUtils.createProduct('Apple', user),
    ];

    await persistProducts(products);

    const foundProducts = await service.findMany({ user });

    expect(foundProducts).toHaveLength(products.length);
  });

  test('Return empty array if no products are found', async () => {
    const products = await service.findMany({ user });

    expect(products).toHaveLength(0);
  });

  test('Exclude deleted products', async () => {
    const products = [
      TestUtils.createProduct('Butter', user),
      TestUtils.createProduct('Bread', user),
      TestUtils.createProduct('Apple', user),
    ];

    await persistProducts(products);

    expect(await service.findMany({ user })).toHaveLength(3);

    const product = await getRepository(Product).findOne({ name: 'Butter' });
    const deletedProduct = await service.delete(product);

    expect(await service.findMany({ user })).toHaveLength(2);
    expect(product).toEqual(deletedProduct);
  });
});

describe('get()', () => {
  test('Gets by properties', async () => {
    const product = await getRepository(Product).save(TestUtils.createProduct('Milk', user));
    const gottenProduct = await service.get({ name: 'Milk' });

    expect(gottenProduct.id).toEqual(product.id);
  });

  test('Throws exception if not gotten by properties', async () => {
    const getProduct = () => service.get({ name: 'not-found' });

    await expect(getProduct()).rejects.toThrow(EntityNotFoundError);
  });

  test('Throws exception if product is deleted', async () => {
    const createdProduct = await TestUtils.persistProduct(TestUtils.createProduct('Apples', user));
    await service.delete(createdProduct);

    const getProduct = () => service.get({ name: 'Apples', user });

    await expect(getProduct()).rejects.toThrow(EntityNotFoundError);
  });
});

describe('delete()', () => {
  test('Soft-delete product', async () => {
    const createdProduct = await persistProduct('crackers');
    const product = await service.get({ name: createdProduct.name });
    const deletedProduct = await service.delete(product);

    expect(deletedProduct.deletedAt).not.toBeNull();
  });
});

describe('search()', () => {
  it('Find relevant products', async () => {
    const products = [
      TestUtils.createProduct('Butter', user),
      TestUtils.createProduct('Bread', user),
      TestUtils.createProduct('Apple', user),
    ];

    await persistProducts(products);

    const searchResults = await service.search('Butt', user);

    expect(searchResults).toHaveLength(2);
    // The first product should have a high likeness
    expect(searchResults[0].likeness).toBeGreaterThan(75);
    // Should not include products with likeness below threshold
    expect(searchResults[searchResults.length - 1].likeness).not.toBeLessThan(10);
    // Should be sorted descending by likeness
    expect(searchResults[0].likeness).toBeGreaterThan(searchResults[1].likeness);
  });

  it('Find more products', async () => {
    const products = [
      TestUtils.createProduct('Butter', user),
      TestUtils.createProduct('Bread', user),
      TestUtils.createProduct('Apple', user),
    ];

    await persistProducts(products);

    const searchResults = await service.search('Butt', user, 0);

    // Should include more products because threshold is set to 0
    expect(searchResults).toHaveLength(products.length);
    // Should include products with low likeness
    expect(searchResults[searchResults.length - 1].likeness).toBeLessThan(10);
  });
});
