import { HttpStatus, INestApplication } from '@nestjs/common';
import * as fs from 'fs';
import { BAD_REQUEST, NO_CONTENT, NOT_FOUND, OK } from 'http-status-codes';
import * as path from 'path';
import * as request from 'supertest';
import { getRepository } from 'typeorm';
import { Product } from '../../src/modules/product/domain/Product';
import { User } from '../../src/modules/user/domain/User';
import { TestUtils } from '../TestUtils';

const IMAGES_PATH = 'assets/images';
const TEST_IMAGES_PATH = 'test/assets/images';

let app: INestApplication;

beforeEach(async () => {
  app = await TestUtils.startApplication();
});

afterEach(async () => TestUtils.shutdown(app));

function getImagePath(fileName: string): string {
  return path.resolve(IMAGES_PATH, fileName);
}

function getTestImagePath(fileName: string): string {
  return path.resolve(TEST_IMAGES_PATH, fileName);
}

async function createProduct(user: User, name: string = 'Pizza'): Promise<Product> {
  const product = TestUtils.createProduct(name, user);
  return await getRepository('product').save(product);
}

async function cleanUpImage(): Promise<void> {
  const savedProduct = await getRepository<Product>('product').findOne({ name: 'Pizza' });
  fs.unlinkSync(getImagePath(savedProduct.image));
}

describe('Upload image', () => {
  test('Invalid payload: No image', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await createProduct(user);

    return request(app.getHttpServer())
      .put(`/api/products/${product.id}/image`)
      .auth(token, { type: 'bearer' })
      .expect(BAD_REQUEST);
  });

  test('Invalid payload: Not an image', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await createProduct(user);
    const filePath = getTestImagePath('text.txt');

    return request(app.getHttpServer())
      .put(`/api/products/${product.id}/image`)
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(BAD_REQUEST);
  });

  test('Invalid payload: Unknown product', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const filePath = getTestImagePath('text.txt');

    return request(app.getHttpServer())
      .put(`/api/products/999/image`)
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(NOT_FOUND);
  });

  test('Invalid payload: Another user\'s product', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const otherUser = await TestUtils.persistUser('jim');
    const otherProduct = await createProduct(otherUser);
    const filePath = getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .put(`/api/products/${otherProduct.id}/image`)
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(NOT_FOUND);
  });

  test('Successful upload', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await createProduct(user);
    const imagePath = getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .put(`/api/products/${product.id}/image`)
      .auth(token, { type: 'bearer' })
      .attach('file', imagePath)
      .expect(HttpStatus.NO_CONTENT)
      .then(async () => {
        await cleanUpImage();
      });
  });
});

describe('Delete image', () => {
  test('Invalid payload: Another user\'s product', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const otherUser = await TestUtils.persistUser('jim');
    const otherProduct = await createProduct(otherUser);
    const filePath = getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .delete(`/api/products/${otherProduct.id}/image`)
      .auth(token, { type: 'bearer' })
      .attach('file', filePath)
      .expect(NOT_FOUND);
  });

  test('Invalid payload: Non-existing image', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);

    return request(app.getHttpServer())
      .delete(`/api/products/999/image`)
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND);
  });

  test('Successful deletion', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await createProduct(user);
    const imagePath = getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .put(`/api/products/${product.id}/image`)
      .auth(token, { type: 'bearer' })
      .attach('file', imagePath)
      .then(() =>
        request(app.getHttpServer())
          .delete(`/api/products/${product.id}/image`)
          .auth(token, { type: 'bearer' })
          .expect(NO_CONTENT));
  });
});

describe('Get image', () => {
  test('Fail on non-existing image', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await createProduct(user);

    return request(app.getHttpServer())
      .get(`/api/products/${product.id}/image`)
      .auth(token, { type: 'bearer' })
      .expect(NOT_FOUND);
  });

  test('Fail on another user\'s image', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const otherUser = await TestUtils.persistUser('jim');
    const otherToken = await TestUtils.loginUser(otherUser, app);
    const otherProduct = await createProduct(otherUser);
    const imagePath = getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .put(`/api/products/${otherProduct.id}/image`)
      .auth(otherToken, { type: 'bearer' })
      .attach('file', imagePath)
      .then(() => {

        return request(app.getHttpServer())
          .get(`/api/products/${otherProduct.id}/image`)
          .auth(token, { type: 'bearer' })
          .expect(NOT_FOUND)
          .then(async () => {
            await cleanUpImage();
          });
      });
  });

  test('Successfully get existing image', async () => {
    const user = await TestUtils.persistUser();
    const token = await TestUtils.loginUser(user, app);
    const product = await createProduct(user);
    const imagePath = getTestImagePath('image-jpg.jpg');

    return request(app.getHttpServer())
      .put(`/api/products/${product.id}/image`)
      .auth(token, { type: 'bearer' })
      .attach('file', imagePath)
      .then(() => {

        return request(app.getHttpServer())
          .get(`/api/products/${product.id}/image`)
          .auth(token, { type: 'bearer' })
          .expect(OK)
          .then(async () => {
            await cleanUpImage();
          });
      });
  });
});
