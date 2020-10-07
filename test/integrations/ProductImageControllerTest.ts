/* eslint-disable jest/expect-expect,@typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from 'http-status-codes';
import * as request from 'supertest';
import { Product } from '../../src/modules/product/domain/Product';
import { User } from '../../src/modules/user/domain/User';
import { TestHelpers } from '../TestHelpers';
import { TestUtils } from '../TestUtils';

let app: INestApplication;

beforeEach(async () => {
  app = await TestUtils.startApplication();
});

afterEach(() => TestUtils.stopApplication(app));

describe('Upload image', () => {
  const getUrl = (id: number): string => `/products/${id}/images`;
  let user: User;
  let token: string;
  let product: Product;

  beforeEach(async () => {
    user = await TestHelpers.persistUser(TestHelpers.createUser());
    token = await TestHelpers.loginUser(user, app);
    product = await TestHelpers.persistProduct(TestHelpers.createProduct(user));
  });

  test('Return 400 on invalid payload (no file uploaded)', () => {
    return request(app.getHttpServer())
      .post(getUrl(product.id))
      .auth(token, { type: 'bearer' })
      .expect(BAD_REQUEST)
      .then(res => TestHelpers.expectErrorResponse(res));
  });

  test('Return 404 on invalid payload (invalid file type)', () => {
    const filePath = TestHelpers.getTestImagePath('text.txt');

    return request(app.getHttpServer())
      .post(getUrl(product.id))
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(BAD_REQUEST)
      .then(res => TestHelpers.expectErrorResponse(res));
  });

  test('Return 404 on product owned by another user', async () => {
    const otherUser = await TestHelpers.persistUser(TestHelpers.createUser());
    const otherProduct = await TestHelpers.persistProduct(TestHelpers.createProduct(otherUser));
    const filePath = TestHelpers.getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .post(getUrl(otherProduct.id))
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(NOT_FOUND)
      .then(res => TestHelpers.expectErrorResponse(res, NOT_FOUND));
  });

  test('Return 404 on unknown product', () => {
    const filePath = TestHelpers.getTestImagePath('text.txt');

    return request(app.getHttpServer())
      .post(getUrl(999))
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(NOT_FOUND)
      .then(res => TestHelpers.expectErrorResponse(res, NOT_FOUND));
  });

  test('Return 201 and product image', async () => {
    const imagePath = TestHelpers.getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .post(getUrl(product.id))
      .auth(token, { type: 'bearer' })
      .attach('file', imagePath)
      .expect(CREATED)
      .then(({ body }) => {
        expect(body).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          path: expect.any(String),
          fullPath: expect.any(String),
        });
      });
  });
});

describe('Delete image', () => {
  const getUrl = (id: number, imageId: number): string => `/products/${id}/images/${imageId}`;
  let user: User;
  let token: string;
  let product: Product;

  beforeEach(async () => {
    user = await TestHelpers.persistUser(TestHelpers.createUser());
    token = await TestHelpers.loginUser(user, app);
    product = await TestHelpers.persistProduct(TestHelpers.createProduct(user));
  });

  test('Return 404 on product owned by another user', async () => {
    const otherUser = await TestHelpers.persistUser(TestHelpers.createUser());
    const otherProduct = await TestHelpers.persistProduct(TestHelpers.createProduct(otherUser));
    const otherProductImage = await TestHelpers.persistProductImage(TestHelpers.createProductImage(otherProduct));

    return request(app.getHttpServer())
      .delete(getUrl(otherProduct.id, otherProductImage.id))
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND)
      .then(res => TestHelpers.expectErrorResponse(res, NOT_FOUND));
  });

  test('Return 404 on non-existing image', () => {
    return request(app.getHttpServer())
      .delete(getUrl(product.id, 999))
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND)
      .then(res => TestHelpers.expectErrorResponse(res, NOT_FOUND));
  });

  test('Return 200 and product image', async () => {
    const productImage = await TestHelpers.persistProductImage(TestHelpers.createProductImage(product));

    return request(app.getHttpServer())
      .delete(getUrl(product.id, productImage.id))
      .auth(token, { type: 'bearer' })
      .expect(OK)
      .then(({ body }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...deletedProductImage } = classToPlain(productImage);
        expect(body).toEqual(deletedProductImage);
      });
  });
});
