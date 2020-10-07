/* eslint-disable jest/no-standalone-expect */
import { INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import * as path from 'path';
import * as request from 'supertest';
import { getRepository } from 'typeorm';
import { ResetPasswordToken } from '../src/modules/authentication/domain/ResetPasswordToken';
import { Product } from '../src/modules/product/domain/Product';
import { ProductImage } from '../src/modules/product/domain/ProductImage';
import { User } from '../src/modules/user/domain/User';
import { DateUtils } from '../src/utils/DateUtils';
import { HashUtils } from '../src/utils/HashUtils';

type UniqueArrayItem = string | number | symbol | boolean;

export abstract class TestHelpers {
  public static JWT_REGEX = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

  public static isUniqueArray(array: UniqueArrayItem[]): boolean {
    return new Set(array).size === array.length;
  }

  public static getLast<T>(array: T[]): T {
    return array[array.length - 1];
  }

  public static getTestImagePath(fileName: string): string {
    return path.resolve('test/assets/images', fileName);
  }

  public static createUser(username: string = faker.internet.userName(), password = '123'): User {
    const user = new User();
    user.username = username;
    user.password = HashUtils.createHash(password);
    user.email = `${username}@example.org`;

    return user;
  }

  public static createProduct(user: User, name: string = faker.commerce.productName()): Product {
    const product = new Product();
    product.name = name;
    product.amount = 1;
    product.amountThreshold = 2;
    product.user = user;
    product.images = [];

    return product;
  }

  public static createProductImage(product: Product): ProductImage {
    const image = new ProductImage();
    image.name = 'test.jpg';
    image.path = '';
    image.product = product;

    return image;
  }

  public static createResetPasswordToken(user: User): ResetPasswordToken {
    const token = new ResetPasswordToken();
    token.user = user;
    token.expiresAt = DateUtils.addHours(3);
    token.hash = '12345689';

    return token;
  }

  public static persistUser(user: User): Promise<User> {
    return getRepository(User).save(user);
  }

  public static persistProduct(product: Product): Promise<Product> {
    return getRepository('product').save(product);
  }

  public static persistProductImage(productImage: ProductImage): Promise<ProductImage> {
    return getRepository(ProductImage).save(productImage);
  }

  public static persistResetPasswordToken(token: ResetPasswordToken): Promise<ResetPasswordToken> {
    return getRepository(ResetPasswordToken).save(token);
  }

  public static async loginUser(user: User, app: INestApplication): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/login')
      .send({ username: user.username, password: '123' });

    return <string>response.body.token;
  }

  public static expectErrorResponse({ body }: request.Response, statusCode: number = StatusCodes.BAD_REQUEST): void {
    expect(body).toEqual(expect.objectContaining({ statusCode, error: getReasonPhrase(statusCode) }));

    if (statusCode === StatusCodes.BAD_REQUEST) {
      expect(body).toHaveProperty('message');
      expect(Array.isArray(body.message)).toBeTruthy();
      expect(body.message.length).toBeGreaterThan(0);

      ['property', 'target', 'constraints'].forEach(property => expect(body.message[0]).toHaveProperty(property));
    }
  }
}
