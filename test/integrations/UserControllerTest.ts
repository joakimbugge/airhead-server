import { INestApplication } from '@nestjs/common';
import { BAD_REQUEST, CREATED } from 'http-status-codes';
import * as request from 'supertest';
import { TestHelpers } from '../TestHelpers';
import { TestUtils } from '../TestUtils';

let app: INestApplication;

beforeEach(async () => {
  app = await TestUtils.startApplication();
});

afterEach(() => TestUtils.stopApplication(app));

describe('Create new user', () => {
  const URL = '/users';

  test('Return 201 and created user', async () => {
    const user = {
      username: 'jim',
      email: 'jim@example.org',
      password: '123',
    };

    return request(app.getHttpServer())
      .post(URL)
      .send(user)
      .expect(CREATED)
      .then(({ body }) => {
        expect(body).toEqual({
          id: expect.any(Number),
          username: user.username,
          email: user.email,
        });
      });
  });

  test('Return 400 on invalid payload', async () => {
    return request(app.getHttpServer())
      .post(URL)
      .send({ username: 'jim', email: 'jim@example.org' })
      .expect(BAD_REQUEST)
      .then(res => TestHelpers.expectErrorResponse(res));
  });

  test('Return 400 on existing username', async () => {
    const user = await TestHelpers.persistUser(TestHelpers.createUser());

    return request(app.getHttpServer())
      .post(URL)
      .send({
        username: user.username,
        password: '123',
        email: 'random@example.com',
      })
      .expect(BAD_REQUEST)
      .then(res => TestHelpers.expectErrorResponse(res));
  });

  test('Return 400 on existing email', async () => {
    const user = await TestHelpers.persistUser(TestHelpers.createUser());

    return request(app.getHttpServer())
      .post(URL)
      .send({
        username: 'john',
        password: '123',
        email: user.email,
      })
      .expect(BAD_REQUEST)
      .then(res => TestHelpers.expectErrorResponse(res));
  });
});
