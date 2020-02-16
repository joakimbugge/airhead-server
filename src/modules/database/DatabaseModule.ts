import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ResetPasswordToken } from '../authentication/domain/ResetPasswordToken';
import { Token } from '../authentication/domain/Token';
import { ConfigService } from '../config/services/ConfigService';
import { Product } from '../product/domain/Product';
import { ProductImage } from '../product/domain/ProductImage';
import { User } from '../user/domain/User';

type DatabaseOptions = Partial<TypeOrmModuleOptions>;

function getOptions(): DatabaseOptions {
  const config = new ConfigService();

  const defaultOptions = {
    name: 'default',
    type: config.env.DB_TYPE,
    synchronize: config.env.DB_SYNCHRONIZE,
    dropSchema: config.env.DB_DROP_SCHEMA,
    logging: config.env.DB_LOGGING,
    entities: [User, Product, ProductImage, Token, ResetPasswordToken],
    migrationsTableName: 'migration',
    migrations: [`${__dirname}/migrations/**.ts`],
    cli: {
      migrationsDir: `${__dirname}/migrations`,
    },
  } as DatabaseOptions;

  let options: DatabaseOptions;

  if (config.env.DB_URL) {
    options = {
      ...defaultOptions,
      url: config.env.DB_URL,
    } as DatabaseOptions;
  } else {
    options = {
      ...defaultOptions,
      host: config.env.DB_HOST,
      port: config.env.DB_PORT,
      username: config.env.DB_USERNAME,
      password: config.env.DB_PASSWORD,
      database: config.env.DB_NAME,
    } as DatabaseOptions;
  }

  return options;
}

@Module({
  imports: [
    TypeOrmModule.forRoot(getOptions()),
  ],
})
export class DatabaseModule {
}
