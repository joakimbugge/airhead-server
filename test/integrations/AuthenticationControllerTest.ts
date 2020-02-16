import { INestApplication } from '@nestjs/common';
import { BAD_REQUEST, CREATED, NO_CONTENT, UNAUTHORIZED } from 'http-status-codes';
import * as request from 'supertest';
import { getRepository } from 'typeorm';
import { ResetPasswordToken } from '../../src/modules/authentication/domain/ResetPasswordToken';
import { LoginResponseDto } from '../../src/modules/authentication/dtos/LoginResponseDto';
import { User } from '../../src/modules/user/domain/User';
import { DateUtils } from '../../src/utils/DateUtils';
import { TestUtils } from '../TestUtils';

const JWT_REGEX = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
let app: INestApplication;

function persistResetPasswordToken(user: User): Promise<ResetPasswordToken> {
  const token = new ResetPasswordToken();
  token.user = user;
  token.expiresAt = DateUtils.addHours(3);
  token.hash = '12345689';

  return getRepository(ResetPasswordToken).save(token);
}

beforeEach(async () => {
  app = await TestUtils.startApplication();
});

afterEach(async () => TestUtils.shutdown(app));

describe('Login', () => {
  beforeEach(async () => {
    await TestUtils.persistUser();
  });

  test('Successful login', async () => {
    return request(app.getHttpServer())
      .post(`/login`)
      .send({ username: 'john', password: '123' })
      .expect(CREATED)
      .then(async res => {
        const body = res.body as LoginResponseDto;
        expect(body).toHaveProperty('token');
        expect(body.token).toMatch(JWT_REGEX);
      });
  });

  test('Fail on wrong password', async () => {
    return request(app.getHttpServer())
      .post(`/login`)
      .send({ username: 'john', password: '789' })
      .expect(UNAUTHORIZED);
  });

  test('Fail on wrong username', async () => {
    return request(app.getHttpServer())
      .post(`/login`)
      .send({ username: 'jerry', password: '123' })
      .expect(UNAUTHORIZED);
  });

  test('Fail on invalid payload', () => {
    return request(app.getHttpServer())
      .post(`/login`)
      .send({ username: 'jerry' })
      .expect(BAD_REQUEST);
  });
});

describe('Reset password', () => {
  test('Successful on existing user', () => {
    return request(app.getHttpServer())
      .post(`/reset-password`)
      .send({ email: 'john@example.com' })
      .expect(CREATED);
  });

  test('Successful on unknown user', () => {
    return request(app.getHttpServer())
      .post(`/reset-password`)
      .send({ email: 'jerry@example.org' })
      .expect(CREATED);
  });

  test('Fail on invalid payload', () => {
    return request(app.getHttpServer())
      .post(`/reset-password`)
      .send({})
      .expect(BAD_REQUEST);
  });
});

describe('Reset password: Change password', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await TestUtils.persistUser();
    token = await persistResetPasswordToken(user);
  });

  test('Successful on valid payload', () => {
    const verifyLogin = (password: string, statusCode: number) =>
      request(app.getHttpServer())
        .post('/login')
        .send({ username: user.username, password })
        .expect(statusCode);

    return request(app.getHttpServer())
      .put(`/reset-password/${token.hash}`)
      .send({ password: '1234', repeatPassword: '1234' })
      .expect(NO_CONTENT)
      .then(() => verifyLogin('1234', CREATED))
      .then(() => verifyLogin('123', UNAUTHORIZED));
  });

  test('Successful on invalid token', () => {
    return request(app.getHttpServer())
      .put('/reset-password/1234')
      .send({ password: '123', repeatPassword: '123' })
      .expect(NO_CONTENT);
  });

  test('Fail on invalid payload', () => {
    return request(app.getHttpServer())
      .put(`/reset-password/${token.hash}`)
      .send({ password: '123', repeatPassword: '1234' })
      .expect(BAD_REQUEST);
  });
});
