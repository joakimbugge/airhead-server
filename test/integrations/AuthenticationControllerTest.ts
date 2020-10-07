/* eslint-disable jest/expect-expect */
import { INestApplication } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import * as request from 'supertest';
import { ResetPasswordToken } from '../../src/modules/authentication/domain/ResetPasswordToken';
import { User } from '../../src/modules/user/domain/User';
import { TestHelpers } from '../TestHelpers';
import { TestUtils } from '../TestUtils';

let app: INestApplication;

beforeEach(async () => {
  app = await TestUtils.startApplication();
});

afterEach(() => TestUtils.stopApplication(app));

describe('Login', () => {
  const URL = '/login';

  beforeEach(async () => {
    await TestHelpers.persistUser(TestHelpers.createUser('john', '123'));
  });

  test('Return 200 and token on valid username and password', async () => {
    return request(app.getHttpServer())
      .post(URL)
      .send({ username: 'john', password: '123' })
      .expect(StatusCodes.CREATED)
      .then(({ body: { token } }) => {
        expect(token).toMatch(TestHelpers.JWT_REGEX);
      });
  });

  test('Return 401 on invalid password', async () => {
    return request(app.getHttpServer())
      .post(URL)
      .send({ username: 'john', password: '789' })
      .expect(StatusCodes.UNAUTHORIZED);
  });

  test('Return 401 on invalid username', async () => {
    return request(app.getHttpServer())
      .post(URL)
      .send({ username: 'jerry', password: '123' })
      .expect(StatusCodes.UNAUTHORIZED);
  });

  test('Return 400 on invalid payload', () => {
    return request(app.getHttpServer())
      .post(URL)
      .send({ username: 'jerry' })
      .expect(StatusCodes.BAD_REQUEST)
      .then(res => TestHelpers.expectErrorResponse(res));
  });
});

describe('Reset password', () => {
  const URL = '/reset-password';

  test('Return 201 on known email', () => {
    return request(app.getHttpServer()).post(URL).send({ email: 'john@example.com' }).expect(StatusCodes.CREATED);
  });

  test('Return 201 as a disguise for error on unknown email', () => {
    return request(app.getHttpServer()).post(URL).send({ email: 'jerry@example.org' }).expect(StatusCodes.CREATED);
  });

  test('Return 400 on invalid payload', () => {
    return request(app.getHttpServer())
      .post(URL)
      .send({})
      .expect(StatusCodes.BAD_REQUEST)
      .then(res => TestHelpers.expectErrorResponse(res));
  });
});

describe('Reset password: Change password', () => {
  const URL = '/reset-password';
  let user: User;
  let token: ResetPasswordToken;

  beforeEach(async () => {
    user = await TestHelpers.persistUser(TestHelpers.createUser());
    token = await TestHelpers.persistResetPasswordToken(TestHelpers.createResetPasswordToken(user));
  });

  test('Return 201 on valid token', () => {
    const verifyLogin = (password: string, statusCode: number) =>
      request(app.getHttpServer()).post('/login').send({ username: user.username, password }).expect(statusCode);

    return request(app.getHttpServer())
      .put(`${URL}/${token.hash}`)
      .send({ password: '1234', repeatPassword: '1234' })
      .expect(StatusCodes.NO_CONTENT)
      .then(() => verifyLogin('1234', StatusCodes.CREATED))
      .then(() => verifyLogin('123', StatusCodes.UNAUTHORIZED));
  });

  test('Return 201 as a disguised error on invalid token', () => {
    return request(app.getHttpServer())
      .put(`${URL}/1234`)
      .send({ password: '123', repeatPassword: '123' })
      .expect(StatusCodes.NO_CONTENT);
  });

  test('Return 400 on invalid payload', () => {
    return request(app.getHttpServer())
      .put(`${URL}/${token.hash}`)
      .send({ password: '123', repeatPassword: '1234' })
      .expect(StatusCodes.BAD_REQUEST);
  });
});
