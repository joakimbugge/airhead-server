import { Module } from '@nestjs/common';
import { metadata } from './server/metadata';

@Module(metadata)
export class AppModule {}
