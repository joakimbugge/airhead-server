import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as sharp from 'sharp';
import { Sharp } from 'sharp';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { UnsupportedImageTypeException } from '../../../server/exceptions/UnsupportedImageTypeException';
import { Service } from '../../../services/Service';
import { ProductImage } from '../domain/ProductImage';
import { FormatImageOptions } from '../interfaces/FormatImageOptions';

@Injectable()
export class ProductImageService extends Service<ProductImage> {
  constructor(
    @InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>,
  ) {
    super(productImageRepository);
  }

  private static toSharp(buffer: Buffer): Sharp {
    try {
      return sharp(buffer);
    } catch (e) {
      throw new UnsupportedImageTypeException();
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
      throw new UnsupportedImageTypeException();
    }
  }

  public async createFileName(buffer: Buffer): Promise<string> {
    const image = ProductImageService.toSharp(buffer);
    const extension = (await image.metadata()).hasAlpha ? '.png' : '.jpg';

    return uuid() + extension;
  }

  public async getContentType(buffer: Buffer): Promise<string> {
    const image = ProductImageService.toSharp(buffer);
    const prefix = 'image';

    return (await image.metadata()).hasAlpha ? `${prefix}/png` : `${prefix}/jpg`;
  }
}
