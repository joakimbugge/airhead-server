import { Global, Module } from '@nestjs/common';
import { ConfigService } from './services/ConfigService';

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {
}
