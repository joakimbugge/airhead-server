import { Module } from '@nestjs/common';
import { UserModule } from '../user/UserModule';
import { AuthenticationController } from './controllers/AuthenticationController';
import { AuthenticationService } from './services/AuthenticationService';
import { JwtPassportStrategy } from './strategies/JwtPassportStrategy';

@Module({
  imports: [UserModule],
  controllers: [AuthenticationController],
  providers: [JwtPassportStrategy, AuthenticationService],
})
export class AuthenticationModule {
}
