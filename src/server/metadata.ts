import { AuthenticationModule } from '../modules/authentication/AuthenticationModule';
import { ConfigModule } from '../modules/config/ConfigModule';
import { DatabaseModule } from '../modules/database/DatabaseModule';
import { LogModule } from '../modules/logging/LogModule';
import { ProductModule } from '../modules/product/ProductModule';
import { SharedModule } from '../modules/shared/SharedModule';
import { UserModule } from '../modules/user/UserModule';

export const metadata = {
  imports: [DatabaseModule, LogModule, UserModule, AuthenticationModule, ConfigModule, ProductModule, SharedModule],
};
