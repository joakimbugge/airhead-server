import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { NO_CONTENT } from 'http-status-codes';
import * as path from 'path';
import { Authed } from '../../../server/decorators/Authed';
import { Authenticated } from '../../../server/decorators/Authenticated';
import { UnsupportedImageTypeError } from '../../../server/errors/UnsupportedImageTypeError';
import { ConfigService } from '../../config/services/ConfigService';
import { User } from '../../user/domain/User';
import { ProductImageService } from '../services/ProductImageService';
import { ProductService } from '../services/ProductService';

@Controller('products')
export class ProductImageController {
  constructor(private readonly productService: ProductService,
              private readonly productImageService: ProductImageService,
              private readonly configService: ConfigService) {
  }

  @Get('/:id/image')
  @Authenticated()
  public async getImage(@Param('id') id: number, @Authed() user: User, @Res() response) {
    const product = await this.productService.get({ id, user });
    const filePath = `${this.configService.env.IMAGES_PATH}/${product.image}`;

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException();
    }

    response.sendFile(path.resolve(filePath));
  }

  @Put('/:id/image')
  @HttpCode(NO_CONTENT)
  @UseInterceptors(FileInterceptor('file'))
  @Authenticated()
  public async uploadImage(@Param('id') id: number, @UploadedFile() file, @Authed() user: User): Promise<void> {
    if (file == null) {
      throw new BadRequestException('No image provided');
    }

    const product = await this.productService.get({ id, user });

    try {
      const image = await this.productImageService.format(file.buffer);
      const fileName = await this.productImageService.save(image); // Save image to disk

      await this.productService.save({ ...product, image: fileName }); // Add image to product
    } catch (e) {
      if (e instanceof UnsupportedImageTypeError) {
        throw new BadRequestException(e.message);
      }

      throw new InternalServerErrorException();
    }
  }

  @Delete('/:id/image')
  @HttpCode(NO_CONTENT)
  @Authenticated()
  public async deleteImage(@Param('id') id: number, @Authed() user: User): Promise<void> {
    const product = await this.productService.get({ id }, { relations: ['user'] });

    // Hides the fact that someone else is owning the product image
    if (product.user.id !== user.id) {
      throw new NotFoundException();
    }

    if (product.image) {
      this.productImageService.delete(product.image);

      product.image = null;
      await this.productService.save(product);
    }
  }
}
