import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { LogService } from '../src/modules/logging/services/LogService';
import { StorageService } from '../src/modules/shared/services/StorageService';
import { getExceptionFilters, getInterceptors, getPipes } from '../src/server/helpers';
import { metadata } from '../src/server/metadata';

export abstract class TestUtils {
  private static storageService = {
    composeCdnUrl: () => '',
    upload: () => new Promise(resolve => resolve()),
    delete: () => new Promise(resolve => resolve()),
  };

  private static logService = {
    info: () => null,
    error: () => null,
  };

  public static createApplication(): Promise<TestingModule> {
    return Test.createTestingModule(metadata)
      .overrideProvider(StorageService)
      .useValue(this.storageService)
      .overrideProvider(LogService)
      .useValue(this.logService)
      .compile();
  }

  public static async startApplication(): Promise<INestApplication> {
    const app = (await this.createApplication()).createNestApplication();
    const logService = app.get(LogService);
    const { httpAdapter } = app.get(HttpAdapterHost);

    app.useGlobalPipes(...getPipes());
    app.useGlobalFilters(...getExceptionFilters(httpAdapter, logService));
    app.useGlobalInterceptors(...getInterceptors());

    return await app.init();
  }

  public static stopApplication(app: INestApplication | TestingModule): Promise<void> {
    return app.close();
  }
}
