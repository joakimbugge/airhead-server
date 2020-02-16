import { Injectable } from '@nestjs/common';
import { AWSError, S3 } from 'aws-sdk';
import { ConfigService } from '../../config/services/ConfigService';

@Injectable()
export class StorageService {
  private readonly s3: S3;

  constructor(private readonly config: ConfigService) {
    const {
      DO_SPACES_REGION,
      DO_SPACES_URL,
      DO_SPACES_ACCESS_KEY,
      DO_SPACES_SECRET_KEY,
    } = this.config.env;

    this.s3 = new S3({
      endpoint: `${DO_SPACES_REGION}.${DO_SPACES_URL}`,
      accessKeyId: DO_SPACES_ACCESS_KEY,
      secretAccessKey: DO_SPACES_SECRET_KEY,
    });
  }

  private static composeEnvironmentalPath(path: string): string {
    return `${process.env.NODE_ENV}/${path}`;
  }

  public composeCdnUrl(path: string): string {
    const {
      DO_SPACES_NAME,
      DO_SPACES_REGION,
      DO_SPACES_URL,
    } = this.config.env;
    const environmentalPath = StorageService.composeEnvironmentalPath(path);

    return `https://${DO_SPACES_NAME}.${DO_SPACES_REGION}.cdn.${DO_SPACES_URL}/${environmentalPath}`;
  }

  public upload(path: string, file: Buffer, contentType: string): Promise<void | AWSError> {
    return new Promise(((resolve, reject) => {
      this.s3.putObject({
        Bucket: this.config.env.DO_SPACES_NAME,
        Key: StorageService.composeEnvironmentalPath(path),
        Body: file,
        ACL: 'public-read',
        ContentType: contentType,
      }, error => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    }));
  }

  public delete(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject({
        Bucket: this.config.env.DO_SPACES_NAME,
        Key: StorageService.composeEnvironmentalPath(path),
      }, error => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    });
  }
}
