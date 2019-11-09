import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { getErrorFilters, getInterceptors, getPipes } from './server/helpers';

(async function bootstrap() {
  const port = process.env.PORT || 3001;
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(...getPipes());
  app.useGlobalFilters(...getErrorFilters());
  app.useGlobalInterceptors(...getInterceptors());

  await app.listen(port);
})();
