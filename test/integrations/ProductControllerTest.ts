import { INestApplication } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from 'http-status-codes';
import { User } from 'src/modules/user/domain/User';
import * as request from 'supertest';
import { TestHelpers } from '../TestHelpers';
import { TestUtils } from '../TestUtils';

let app: INestApplication;

beforeEach(async () => {
  app = await TestUtils.startApplication();
});

afterEach(() => TestUtils.stopApplication(app));

describe('Get products', () => {
  const URL = '/products';
  let user: User;
  let token: string;

  beforeEach(async () => {
    user = await TestHelpers.persistUser(TestHelpers.createUser());
    token = await TestHelpers.loginUser(user, app);
  });

  test('Return 200 and empty list for user without products', async () => {
    return request(app.getHttpServer())
      .get(URL)
      .auth(token, { type: 'bearer' })
      .expect(OK)
      .then(async ({ body }) => {
        expect(body).toHaveLength(0);
      });
  });

  test('Return 200 and list of products', async () => {
    const firstProduct = await TestHelpers.persistProduct(TestHelpers.createProduct(user));
    const secondProduct = await TestHelpers.persistProduct(TestHelpers.createProduct(user));

    return request(app.getHttpServer())
      .get(URL)
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
  const URL = '/products';
  let user: User;
  let token: string;

  beforeEach(async () => {
    user = await TestHelpers.persistUser(TestHelpers.createUser());
    token = await TestHelpers.loginUser(user, app);
  });

  test('Return 404 on unknown product', async () => {
    return request(app.getHttpServer())
      .get(`${URL}/999`)
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND)
      .then(res => TestHelpers.expectErrorResponse(res, NOT_FOUND));
  });

  test('Return 200 and product', async () => {
    const product = await TestHelpers.persistProduct(TestHelpers.createProduct(user));

    return request(app.getHttpServer())
      .get(`/products/${product.id}`)
      .auth(token, { type: 'bearer' })
      .expect(OK)
      .then(({ body }) => {
        expect(body).toEqual(classToPlain(product));
      });
  });
});

describe('Create product', () => {
  const URL = '/products';
  let user: User;
  let token: string;

  beforeEach(async () => {
    user = await TestHelpers.persistUser(TestHelpers.createUser());
    token = await TestHelpers.loginUser(user, app);
  });

  test('Return 400 on invalid payload (missing property)', async () => {
    return request(app.getHttpServer())
      .post(URL)
      .auth(token, { type: 'bearer' })
      .send({ amount: 1, amountThreshold: 2 })
      .expect(BAD_REQUEST)
      .then(res => TestHelpers.expectErrorResponse(res));
  });

  test('Return 400 on invalid payload (invalid property value)', async () => {
    return request(app.getHttpServer())
      .post(URL)
      .auth(token, { type: 'bearer' })
      .send({ name: 'Pizza', amount: 'one', amountThreshold: 2 })
      .expect(BAD_REQUEST)
      .then(res => TestHelpers.expectErrorResponse(res));
  });

  test('Return 201 and created product on valid payload', async () => {
    const createdProduct = { name: 'Pizza', amount: 1, amountThreshold: 2 };

    return request(app.getHttpServer())
      .post(URL)
      .auth(token, { type: 'bearer' })
      .send(createdProduct)
      .expect(CREATED)
      .then(({ body }) => {
        expect(body).toEqual({
          id: expect.any(Number),
          ...classToPlain(createdProduct),
        });
      });
  });
});

describe('Update product', () => {
  const URL = '/products';
  let user: User;
  let token: string;

  beforeEach(async () => {
    user = await TestHelpers.persistUser(TestHelpers.createUser());
    token = await TestHelpers.loginUser(user, app);
  });

  test('Return 400 on invalid payload (invalid property value)', async () => {
    const product = await TestHelpers.persistProduct(TestHelpers.createProduct(user));
    const changedProduct = { ...product, amount: 'one' };

    return request(app.getHttpServer())
      .put(`${URL}/${product.id}`)
      .auth(token, { type: 'bearer' })
      .send(changedProduct)
      .expect(BAD_REQUEST)
      .then(res => TestHelpers.expectErrorResponse(res));
  });

  test('Return 404 on product owned by another user', async () => {
    const otherUser = await TestHelpers.persistUser(TestHelpers.createUser());
    const otherProduct = await TestHelpers.persistProduct(TestHelpers.createProduct(otherUser));

    return request(app.getHttpServer())
      .put(`${URL}/${otherProduct.id}`)
      .auth(token, { type: 'bearer' })
      .send({ name: 'Pizza', amount: 3, amountThreshold: 2 })
      .expect(NOT_FOUND)
      .then(res => TestHelpers.expectErrorResponse(res, NOT_FOUND));
  });

  test('Return 200 on updated product', async () => {
    const product = await TestHelpers.persistProduct(TestHelpers.createProduct(user));
    const updatedProduct = { ...classToPlain(product), amount: 2 };

    return request(app.getHttpServer())
      .put(`${URL}/${product.id}`)
      .auth(token, { type: 'bearer' })
      .send(updatedProduct)
      .expect(OK)
      .then(({ body }) => {
        expect(body).toEqual(updatedProduct);
      });
  });
});

describe('Delete product', () => {
  const URL = '/products';
  let user: User;
  let token: string;

  beforeEach(async () => {
    user = await TestHelpers.persistUser(TestHelpers.createUser());
    token = await TestHelpers.loginUser(user, app);
  });

  test('Return 404 on unknown product', async () => {
    return request(app.getHttpServer())
      .delete(`${URL}/999`)
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND)
      .then(res => TestHelpers.expectErrorResponse(res, NOT_FOUND));
  });

  test('Return 404 on product owned by another user', async () => {
    const otherUser = await TestHelpers.persistUser(TestHelpers.createUser());
    const otherProduct = await TestHelpers.persistProduct(TestHelpers.createProduct(otherUser));

    return request(app.getHttpServer())
      .delete(`${URL}/${otherProduct.id}`)
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND)
      .then(res => TestHelpers.expectErrorResponse(res, NOT_FOUND));
  });

  test('Return 200 and deleted product', async () => {
    const product = await TestHelpers.persistProduct(TestHelpers.createProduct(user));

    return request(app.getHttpServer())
      .delete(`/products/${product.id}`)
      .auth(token, { type: 'bearer' })
      .expect(OK)
      .then(({ body }) => {
        expect(body).toEqual(classToPlain(product));
      });
  });
});
