import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { getRepository } from 'typeorm';
import { User } from '../src/modules/user/domain/User';
import { getErrorFilters, getInterceptors, getPipes } from '../src/server/helpers';
import { metadata } from '../src/server/metadata';
import { HashUtils } from '../src/utils/HashUtils';

export abstract class TestUtils {
  public static async createModule(): Promise<TestingModule> {
    return await Test.createTestingModule(metadata).compile();
  }

  public static async startApplication(): Promise<INestApplication> {
    const app = (await TestUtils.createModule()).createNestApplication();

    app.setGlobalPrefix('api');
    app.useGlobalPipes(...getPipes());
    app.useGlobalFilters(...getErrorFilters());
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
        .post('/api/login')
        .send({ username: user.username, password: '123' })
        .then(res => {
          resolve(res.body.token);
        });
    });
  }
}
