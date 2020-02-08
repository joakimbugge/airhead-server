import { TestingModule } from '@nestjs/testing';
import { ForgotPasswordToken } from '../../../src/modules/authentication/domain/ForgotPasswordToken';
import { ForgotPasswordTokenService } from '../../../src/modules/authentication/services/ForgotPasswordTokenService';
import { TestUtils } from '../../TestUtils';

let app: TestingModule;
let service: ForgotPasswordTokenService;

beforeEach(async () => {
  app = await TestUtils.createModule();
  service = app.get(ForgotPasswordTokenService);
});

afterEach(() => TestUtils.shutdown(app));

describe('createForgotPasswordToken()', () => {
  test('Returns token', () => {
    const user = TestUtils.createUser('john');
    const token = service.createToken(user);

    expect(token).toBeInstanceOf(ForgotPasswordToken);
    expect(token.user).toEqual(user);
    expect(token.hash).not.toBeUndefined();
  });
});
