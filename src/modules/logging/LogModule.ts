import { Global, Module } from '@nestjs/common';
import { LogService } from './services/LogService';

@Global()
@Module({
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
