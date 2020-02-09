import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAlreadyExistsException } from '../../../server/exceptions/UserAlreadyExistsException';
import { Service } from '../../../services/Service';
import { User } from '../domain/User';
import { SqlError } from '../enums/SqlError';

@Injectable()
export class UserService extends Service<User> {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {
    super(userRepository);
  }

  public async save(user: User): Promise<User> {
    try {
      return await this.userRepository.save(user);
    } catch (err) {
      switch (err.code) {
        case SqlError.PostgresUniqueViolation:
        case SqlError.SqliteConstraint:
          throw new UserAlreadyExistsException('Username or email already in use');
        default:
          throw err;
      }
    }
  }
}
