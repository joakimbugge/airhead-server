import { TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { getRepository } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { User } from '../../../src/modules/user/domain/User';
import { UserService } from '../../../src/modules/user/services/UserService';
import { UserAlreadyExistsException } from '../../../src/server/exceptions/UserAlreadyExistsException';
import { TestUtils } from '../../TestUtils';

let app: TestingModule;
let service: UserService;

const createMockUser = (username: string = faker.internet.userName()): User =>
  TestUtils.createUser(username);

beforeEach(async () => {
  app = await TestUtils.createModule();
  service = app.get<UserService>(UserService);
});

afterEach(() => TestUtils.shutdown(app));

describe('save()', () => {
  test('Returns reference to original', async () => {
    const user = createMockUser();
    const savedUser = await service.save(user);

    expect(savedUser).toBe(user);
  });

  test('Saves to database', async () => {
    const user = createMockUser();
    const savedUser = await service.save(user);
    const fetchedUser = await getRepository(User).findOne({ id: savedUser.id });

    expect(fetchedUser).not.toBeUndefined();
    expect(fetchedUser).toEqual(savedUser);
  });

  test('Updates database', async () => {
    const user = createMockUser();
    const savedUser = { ...await service.save(user) };

    user.email = 'test@example.org';
    await service.save(user);
    const fetchedUser = await getRepository(User).findOne({ id: user.id });

    expect(fetchedUser).not.toEqual(savedUser);
  });

  test('Throws error if user already exists', async () => {
    const firstUser = createMockUser('john');
    const secondUser = createMockUser('john');

    await service.save(firstUser);

    return expect(service.save(secondUser)).rejects.toThrow(UserAlreadyExistsException);
  });
});

describe('findById()', () => {
  test('Finds by ID', async () => {
    const user = await getRepository(User).save(createMockUser());
    const foundUser = await service.findById(user.id);

    expect(foundUser).toEqual(user);
  });

  test('Returns undefined if not found by ID', async () => {
    const user = await service.findById(99);

    expect(user).toBeUndefined();
  });
});

describe('find()', () => {
  test('Finds by properties', async () => {
    const user = await getRepository(User).save(createMockUser('michael'));
    const foundUser = await service.find({ username: 'michael' });

    expect(foundUser).toEqual(user);
  });

  test('Returns undefined if not found by properties', async () => {
    const user = await service.find({ username: 'bertha' });

    expect(user).toBeUndefined();
  });
});

describe('get()', () => {
  test('Gets by properties', async () => {
    const user = await getRepository(User).save(createMockUser('john'));
    const gottenUser = await service.get({ username: 'john' });

    expect(gottenUser).toEqual(user);
  });

  test('Throws exception if not gotten by properties', async () => {
    const getUser = () => service.get({ username: 'not-found' });

    await expect(getUser()).rejects.toThrow(EntityNotFoundError);
  });
});
