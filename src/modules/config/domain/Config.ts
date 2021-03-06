import { Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsEnum } from 'class-validator';
import { DatabaseType } from '../../database/DatabaseType';

export class Config {
  @IsDefined()
  public SECRET: string;
  @IsEnum(DatabaseType)
  public DB_TYPE: DatabaseType = DatabaseType.Postgres;
  public DB_HOST: string = 'localhost';
  public DB_URL: string;
  @Type(() => Number)
  public DB_PORT: number;
  public DB_USERNAME: string;
  public DB_PASSWORD: string;
  public DB_NAME: string;
  @IsBoolean()
  public DB_SYNCHRONIZE: boolean = false;
  @IsBoolean()
  public DB_DROP_SCHEMA: boolean = false;
  @IsBoolean()
  public DB_LOGGING: boolean = false;
  @Type(() => Number)
  public AUTH_DURATION: number = 3600 * 24;
  public ASSETS_PATH = 'assets';
  public IMAGES_PATH = `${this.ASSETS_PATH}/images`;
  public LOGS_PATH = 'logs';
  public RESET_PASSWORD_TOKEN_HOURS_LIFETIME: number = 72;
  @IsDefined()
  public DO_SPACES_REGION: string;
  @IsDefined()
  public DO_SPACES_NAME: string;
  @IsDefined()
  public DO_SPACES_URL: string;
  @IsDefined()
  public DO_SPACES_SECRET_KEY: string;
  @IsDefined()
  public DO_SPACES_ACCESS_KEY: string;
}
