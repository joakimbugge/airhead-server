import { INestApplication } from '@nestjs/common';
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from 'http-status-codes';
import * as path from 'path';
import * as request from 'supertest';
import { Product } from '../../src/modules/product/domain/Product';
import { ProductImage } from '../../src/modules/product/domain/ProductImage';
import { User } from '../../src/modules/user/domain/User';
import { TestUtils } from '../TestUtils';

let app: INestApplication;

beforeEach(async () => {
  app = await TestUtils.startApplication();
});

afterEach(async () => TestUtils.shutdown(app));

function getTestImagePath(fileName: string): string {
  return path.resolve('test/assets/images', fileName);
}

function persistProduct(user: User, name: string = 'Pizza'): Promise<Product> {
  return TestUtils.persistProduct(TestUtils.createProduct(name, user));
}

function persistProductImage(product: Product): Promise<ProductImage> {
  return TestUtils.persistProductImage(TestUtils.createProductImage(product));
}

describe('Upload image', () => {
  test('Invalid payload: No image', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await persistProduct(user);

    return request(app.getHttpServer())
      .post(`/products/${product.id}/images`)
      .auth(token, { type: 'bearer' })
      .expect(BAD_REQUEST);
  });

  test('Invalid payload: Not an image', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await persistProduct(user);
    const filePath = getTestImagePath('text.txt');

    return request(app.getHttpServer())
      .post(`/products/${product.id}/images`)
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(BAD_REQUEST);
  });

  test('Invalid payload: Unknown product', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const filePath = getTestImagePath('text.txt');

    return request(app.getHttpServer())
      .post(`/products/999/images`)
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(NOT_FOUND);
  });

  test('Invalid payload: Another user\'s product', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const otherUser = await TestUtils.persistUser('jim');
    const otherProduct = await persistProduct(otherUser);
    const filePath = getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .post(`/api/products/${otherProduct.id}/images/`)
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(NOT_FOUND);
  });

  test('Successful upload', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await persistProduct(user);
    const imagePath = getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .post(`/products/${product.id}/images`)
      .auth(token, { type: 'bearer' })
      .attach('file', imagePath)
      .expect(CREATED);
  });
});

describe('Delete image', () => {
  test('Invalid payload: Another user\'s product', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const otherUser = await TestUtils.persistUser('jim');
    const otherProduct = await persistProduct(otherUser);
    const otherProductImage = await persistProductImage(otherProduct);
    const filePath = getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .delete(`/products/${otherProduct.id}/images/${otherProductImage.id}`)
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(NOT_FOUND);
  });

  test('Invalid payload: Non-existing image', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);

    return request(app.getHttpServer())
      .delete(`/products/999/images/999`)
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND);
  });

  test('Successful deletion', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await persistProduct(user);
    const image = await persistProductImage(product);

    request(app.getHttpServer())
      .delete(`/products/${product.id}/images/${image.id}`)
      .auth(token, { type: 'bearer' })
      .expect(OK);
  });
});
