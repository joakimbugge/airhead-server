import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { Sharp } from 'sharp';
import { v4 as uuid } from 'uuid';
import { UnsupportedImageTypeError } from '../../../server/errors/UnsupportedImageTypeError';
import { ConfigService } from '../../config/services/ConfigService';
import { FormatImageOptions } from '../interfaces/FormatImageOptions';

@Injectable()
export class ProductImageService {
  constructor(private readonly configService: ConfigService) {
  }

  private static toSharp(buffer: Buffer): Sharp {
    try {
      return sharp(buffer);
    } catch (e) {
      throw new UnsupportedImageTypeError();
    }
  }

  public async format(buffer: Buffer, options?: FormatImageOptions): Promise<Buffer> {
    const { maxWidth, maxHeight } = { maxWidth: 2000, maxHeight: 2000, ...options };
    const image = ProductImageService.toSharp(buffer);

    try {
      return await image.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      }).toBuffer();
    } catch (e) {
      throw new UnsupportedImageTypeError();
    }
  }

  public async createFileName(buffer: Buffer): Promise<string> {
    const image = ProductImageService.toSharp(buffer);
    const extension = (await image.metadata()).hasAlpha ? '.png' : '.jpg';

    return uuid() + extension;
  }

  public async save(buffer: Buffer, optPath?: string): Promise<string> {
    const fileName = await this.createFileName(buffer);
    const filePath = optPath || this.configService.env.IMAGES_PATH;

    const image = ProductImageService.toSharp(buffer);
    await image.toFile(path.resolve(filePath, fileName));

    return fileName;
  }

  public delete(fileName: string, optPath?: string): void {
    const filePath = optPath || this.configService.env.IMAGES_PATH;
    fs.unlinkSync(path.resolve(filePath, fileName));
  }
}
