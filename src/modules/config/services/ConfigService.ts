import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as _ from 'lodash';
import { Config } from '../domain/Config';

@Injectable()
export class ConfigService {
  public env: Config;

  constructor() {
    const path = `config/${process.env.NODE_ENV}.env`;
    let envConfig;

    if (fs.existsSync(path)) {
      envConfig = dotenv.parse(fs.readFileSync(path));
    } else {
      envConfig = { ...process.env };
    }

    const transformedEnvConfig = ConfigService.transformValues(envConfig);
    const config = plainToClass(Config, transformedEnvConfig);
    const errors = validateSync(config);

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    this.env = config;
  }

  private static transformValues(map: object): object {
    return _.mapValues(map, value => {
      if (value === 'true') {
        return true;
      }

      if (value === 'false') {
        return false;
      }

      return value;
    });
  }
}
