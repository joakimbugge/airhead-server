import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/UserModule';
import { AuthenticationController } from './controllers/AuthenticationController';
import { ResetPasswordToken } from './domain/ResetPasswordToken';
import { AuthenticationService } from './services/AuthenticationService';
import { ResetPasswordService } from './services/ResetPasswordService';
import { JwtPassportStrategy } from './strategies/JwtPassportStrategy';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([ResetPasswordToken])],
  controllers: [AuthenticationController],
  providers: [JwtPassportStrategy, AuthenticationService, ResetPasswordService],
})
export class AuthenticationModule {}
