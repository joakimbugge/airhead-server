import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { LogService } from './modules/logging/services/LogService';
import { getExceptionFilters, getInterceptors, getPipes } from './server/helpers';

(async function bootstrap() {
  const port = process.env.PORT || 3001;
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  const logService = app.get(LogService);
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(...getPipes());
  app.useGlobalFilters(...getExceptionFilters(httpAdapter, logService));
  app.useGlobalInterceptors(...getInterceptors());

  app.use(logService.getIdMiddleware());
  app.use(logService.getRequestMiddleware());
  app.use(logService.getResponseMiddleware());

  await app.listen(port);
})();
