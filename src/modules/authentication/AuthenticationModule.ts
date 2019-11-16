import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/UserModule';
import { AuthenticationController } from './controllers/AuthenticationController';
import { ForgotPasswordToken } from './domain/ForgotPasswordToken';
import { AuthenticationService } from './services/AuthenticationService';
import { ForgotPasswordTokenService } from './services/ForgotPasswordTokenService';
import { JwtPassportStrategy } from './strategies/JwtPassportStrategy';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([ForgotPasswordToken])],
  controllers: [AuthenticationController],
  providers: [JwtPassportStrategy, AuthenticationService, ForgotPasswordTokenService],
})
export class AuthenticationModule {
}
