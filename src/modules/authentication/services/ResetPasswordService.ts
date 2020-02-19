import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../../services/Service';
import { ResetPasswordToken } from '../domain/ResetPasswordToken';

@Injectable()
export class ResetPasswordService extends Service<ResetPasswordToken> {
  constructor(
    @InjectRepository(ResetPasswordToken) repository: Repository<ResetPasswordToken>,
  ) {
    super(repository);
  }
}
