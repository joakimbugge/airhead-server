import { INestApplication } from '@nestjs/common';
import { BAD_REQUEST, CREATED } from 'http-status-codes';
import * as request from 'supertest';
import { FindConditions, getRepository } from 'typeorm';
import { User } from '../../src/modules/user/domain/User';
import { TestUtils } from '../TestUtils';

let app: INestApplication;

beforeEach(async () => {
  app = await TestUtils.startApplication();
});

afterEach(() => TestUtils.shutdown(app));

function getUser(conditions: FindConditions<User>): Promise<User> {
  return getRepository<User>('user').findOne(conditions);
}

describe('Create new user', () => {
  test('Successfully create a new user', async () => {
    const user = {
      username: 'jim',
      email: 'jim@example.org',
      password: '123',
    };

    return request(app.getHttpServer())
      .post('/users')
      .send(user)
      .expect(CREATED)
      .then(async () => {
        const savedUser = await getUser({ username: 'jim' });
        expect(savedUser).not.toBeUndefined();
      });
  });

  test('Receive error if payload is invalid', async () => {
    const user = {
      username: 'jim',
      email: 'jim@example.org',
      // Missing password
    };

    return request(app.getHttpServer())
      .post('/users')
      .send(user)
      .expect(BAD_REQUEST);
  });

  test('Receive error if user already exists', async () => {
    const user = {
      username: 'jim',
      email: 'jim@example.org',
      password: '123',
    };

    return request(app.getHttpServer())
      .post('/users')
      .send(user)
      .then(async () =>
        request(app.getHttpServer())
          .post('/users')
          .send(user)
          .expect(BAD_REQUEST));
  });
});
