import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { getRepository } from 'typeorm';
import { LogService } from '../src/modules/logging/services/LogService';
import { Product } from '../src/modules/product/domain/Product';
import { ProductImage } from '../src/modules/product/domain/ProductImage';
import { StorageService } from '../src/modules/shared/services/StorageService';
import { User } from '../src/modules/user/domain/User';
import { getExceptionFilters, getInterceptors, getPipes } from '../src/server/helpers';
import { metadata } from '../src/server/metadata';
import { HashUtils } from '../src/utils/HashUtils';

export abstract class TestUtils {
  public static async createModule(): Promise<TestingModule> {
    const storageService = {
      getCdnUrl: () => '',
      upload: () => new Promise(resolve => resolve()),
      delete: () => new Promise(resolve => resolve()),
    };

    const logService = {
      info: () => null,
      error: () => null,
    };

    return await Test.createTestingModule(metadata)
                     .overrideProvider(StorageService)
                     .useValue(storageService)
                     .overrideProvider(LogService)
                     .useValue(logService)
                     .compile();
  }

  public static async startApplication(): Promise<INestApplication> {
    const app = (await TestUtils.createModule()).createNestApplication();
    const logService = app.get(LogService);
    const { httpAdapter } = app.get(HttpAdapterHost);

    app.useGlobalPipes(...getPipes());
    app.useGlobalFilters(...getExceptionFilters(httpAdapter, logService));
    app.useGlobalInterceptors(...getInterceptors());

    return await app.init();
  }

  public static async shutdown(app: INestApplication | TestingModule): Promise<void> {
    await app.close();
  }

  public static createUser(username: string, password: string = 'sample'): User {
    const user = new User();

    user.username = username;
    user.password = HashUtils.createHash(password);
    user.email = `${username}@example.org`;

    return user;
  }

  public static persistUser(username: string = 'john'): Promise<User> {
    return getRepository(User).save(TestUtils.createUser(username, '123'));
  }

  public static loginUser(user: User, app: INestApplication): Promise<string> {
    return new Promise(async resolve => {
      request(app.getHttpServer())
        .post('/login')
        .send({ username: user.username, password: '123' })
        .then(res => {
          resolve(res.body.token);
        });
    });
  }

  public static createProduct(name: string, user: User): Product {
    const product = new Product();

    product.name = name;
    product.amount = 1;
    product.amountThreshold = 2;
    product.user = user;
    product.images = [];

    return product;
  }

  public static persistProduct(product: Product): Promise<Product> {
    return getRepository('product').save(product);
  }

  public static createProductImage(product: Product): ProductImage {
    const image = new ProductImage();
    image.name = 'test.jpg';
    image.path = '';
    image.product = product;

    return image;
  }

  public static persistProductImage(productImage: ProductImage): Promise<ProductImage> {
    return getRepository(ProductImage).save(productImage);
  }
}
