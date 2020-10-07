import { Global, Module } from '@nestjs/common';
import { StorageService } from './services/StorageService';

@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class SharedModule {}
