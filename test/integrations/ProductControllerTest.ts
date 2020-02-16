import { INestApplication } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from 'http-status-codes';
import * as request from 'supertest';
import { FindConditions, getRepository } from 'typeorm';
import { Product } from '../../src/modules/product/domain/Product';
import { CreateProductDto } from '../../src/modules/product/dtos/CreateProductDto';
import { UpdateProductDto } from '../../src/modules/product/dtos/UpdateProductDto';
import { User } from '../../src/modules/user/domain/User';
import { TestUtils } from '../TestUtils';

let app: INestApplication;

beforeEach(async () => {
  app = await TestUtils.startApplication();
});

afterEach(async () => TestUtils.shutdown(app));

function getProduct(conditions: FindConditions<Product>): Promise<Product> {
  return getRepository<Product>(Product).findOne(conditions);
}

async function persistProduct(user: User, name: string = 'Pizza'): Promise<Product> {
  return await TestUtils.persistProduct(TestUtils.createProduct(name, user));
}

describe('Get products', () => {
  test('Empty list when user got no products', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);

    return request(app.getHttpServer())
      .get(`/products`)
      .auth(token, { type: 'bearer' })
      .expect(OK)
      .then(async ({ body }) => {
        expect(body).toHaveLength(0);
      });
  });

  test('Populated list when user got products', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const firstProduct = await persistProduct(user);
    const secondProduct = await persistProduct(user, 'Apples');

    return request(app.getHttpServer())
      .get(`/products`)
      .auth(token, { type: 'bearer' })
      .expect(OK)
      .then(async ({ body }) => {
        expect(body).toHaveLength(2);
        expect(body).toContainEqual(classToPlain(firstProduct));
        expect(body).toContainEqual(classToPlain(secondProduct));
      });
  });
});

describe('Get product', () => {
  test('Invalid payload: Product does not exist', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);

    return request(app.getHttpServer())
      .get(`/products/999`)
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND);
  });

  test('Valid payload', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await persistProduct(user);

    return request(app.getHttpServer())
      .get(`/products/${product.id}`)
      .auth(token, { type: 'bearer' })
      .expect(OK)
      .then(async () => {
        const existingProduct = getProduct({ id: product.id });
        expect(product).toMatchObject(existingProduct);
      });
  });
});

describe('Create product', () => {
  test('Invalid payload: Missing property', async () => {
    const token = await TestUtils.loginUser(await TestUtils.persistUser(), app);
    const product = {
      // No name
      amount: 1,
      amountThreshold: 2,
    };

    return request(app.getHttpServer())
      .post('/products')
      .auth(token, { type: 'bearer' })
      .send(product)
      .expect(BAD_REQUEST)
      .then(async () => {
        const savedProduct = await getProduct({ amount: 1 });
        expect(savedProduct).toBeUndefined();
      });
  });

  test('Invalid payload: Invalid value', async () => {
    const token = await TestUtils.loginUser(await TestUtils.persistUser(), app);
    const product = {
      name: 'Pizza',
      amount: 'one', // Invalid value
      amountThreshold: 2,
    };

    return request(app.getHttpServer())
      .post('/products')
      .auth(token, { type: 'bearer' })
      .send(product)
      .expect(BAD_REQUEST)
      .then(async () => {
        const savedProduct = await getProduct({ name: 'Pizza' });
        expect(savedProduct).toBeUndefined();
      });
  });

  test('Valid payload', async () => {
    const token = await TestUtils.loginUser(await TestUtils.persistUser(), app);
    const product: CreateProductDto = {
      name: 'Pizza',
      amount: 1,
      amountThreshold: 2,
    };

    return request(app.getHttpServer())
      .post('/products')
      .auth(token, { type: 'bearer' })
      .send(product)
      .expect(CREATED)
      .then(({ body }) => {
        expect(body).toMatchObject(product);
        expect(body).toHaveProperty('id');
      });
  });
});

describe('Update product', () => {
  test('Invalid payload: Invalid value', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const existingProduct = await persistProduct(user);

    const product = {
      ...existingProduct,
      amount: 'one', // Invalid value
    };

    return request(app.getHttpServer())
      .put(`/products/${existingProduct.id}`)
      .auth(token, { type: 'bearer' })
      .send(product)
      .expect(BAD_REQUEST)
      .then(async () => {
        const savedProduct = await getProduct({ name: 'Pizza' });
        expect(classToPlain(savedProduct)).toEqual(classToPlain(existingProduct));
      });
  });

  test('Invalid payload: User does not own product', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const otherUser = await TestUtils.persistUser('jim');
    const otherExistingProduct = await persistProduct(otherUser);

    const product: UpdateProductDto = {
      name: 'Pizza',
      amount: 3, // Changed value
      amountThreshold: 2,
    };

    return request(app.getHttpServer())
      .put(`/products/${otherExistingProduct.id}`)
      .auth(token, { type: 'bearer' })
      .send(product)
      .expect(NOT_FOUND)
      .then(async () => {
        const savedProduct = await getProduct({ name: 'Pizza' });
        expect(classToPlain(savedProduct)).toEqual(classToPlain(otherExistingProduct));
      });
  });

  test('Valid payload', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const existingProduct = await persistProduct(user);

    existingProduct.amount = 2;

    return request(app.getHttpServer())
      .put(`/products/${existingProduct.id}`)
      .auth(token, { type: 'bearer' })
      .send(existingProduct)
      .expect(OK)
      .then(async () => {
        const savedProduct = await getProduct({ name: 'Pizza' });
        expect(classToPlain(savedProduct)).toEqual(classToPlain(existingProduct));
      });
  });
});

describe('Delete product', () => {
  test('Invalid payload: Non-exsiting product', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);

    return request(app.getHttpServer())
      .delete(`/products/999`)
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND);
  });

  test('Invalid payload: User does not own product', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const otherUser = await TestUtils.persistUser('jim');
    const otherExistingProduct = await persistProduct(otherUser);

    return request(app.getHttpServer())
      .delete(`/products/${otherExistingProduct.id}`)
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND)
      .then(async () => {
        const stillExistingProdduct = await getProduct({ id: otherExistingProduct.id });
        expect(stillExistingProdduct.deletedAt).toBeNull();
      });
  });

  test('Valid payload', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await persistProduct(user);

    return request(app.getHttpServer())
      .delete(`/products/${product.id}`)
      .auth(token, { type: 'bearer' })
      .expect(OK)
      .then(async () => {
        const deletedProduct = await getProduct({ id: product.id });
        expect(deletedProduct.deletedAt).not.toBeNull();
      });
  });
});
