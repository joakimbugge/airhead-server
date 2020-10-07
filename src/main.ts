import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageJson from '../package.json';
import { AppModule } from './AppModule';
import { LogService } from './modules/logging/services/LogService';
import { getExceptionFilters, getInterceptors, getPipes } from './server/helpers';

void (async function bootstrap() {
  const port = process.env.PORT || 3001;
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  const logService = app.get(LogService);
  const { httpAdapter }: HttpAdapterHost = app.get(HttpAdapterHost);
  const { name, description, version, author } = packageJson;

  app.useGlobalPipes(...getPipes());
  app.useGlobalFilters(...getExceptionFilters(httpAdapter, logService));
  app.useGlobalInterceptors(...getInterceptors());

  app.use(logService.getIdMiddleware());
  app.use(logService.getRequestMiddleware());
  app.use(logService.getResponseMiddleware());

  SwaggerModule.setup(
    'api',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle(name)
        .setDescription(description)
        .setVersion(version)
        .setContact(author.name, author.url, author.email)
        .addBearerAuth()
        .build(),
    ),
  );

  await app.listen(port);
})();
