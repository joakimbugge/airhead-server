import { Module } from '@nestjs/common';
import { AuthenticationModule } from './modules/authentication/AuthenticationModule';
import { ConfigModule } from './modules/config/ConfigModule';
import { DatabaseModule } from './modules/database/DatabaseModule';
import { UserModule } from './modules/user/UserModule';

@Module({
  imports: [DatabaseModule, UserModule, AuthenticationModule, ConfigModule],
})
export class AppModule {
}
