import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BAD_REQUEST, NO_CONTENT, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import { ApiBadRequestException } from '../../../docs/exceptions/ApiBadRequestException';
import { ApiNotFoundException } from '../../../docs/exceptions/ApiNotFoundException';
import { ApiUnauthorizedException } from '../../../docs/exceptions/ApiUnauthorizedException';
import { Authed } from '../../../server/decorators/Authed';
import { Authenticated } from '../../../server/decorators/Authenticated';
import { UnsupportedImageTypeException } from '../../../server/exceptions/UnsupportedImageTypeException';
import { ConfigService } from '../../config/services/ConfigService';
import { StorageService } from '../../shared/services/StorageService';
import { User } from '../../user/domain/User';
import { ProductImage } from '../domain/ProductImage';
import { UploadImageDto } from '../dtos/UploadImageDto';
import { ProductImageService } from '../services/ProductImageService';
import { ProductService } from '../services/ProductService';

@Controller('products')
@ApiTags('product images')
@ApiBearerAuth()
export class ProductImageController {
  private readonly STORAGE_FOLDER = 'products';

  constructor(
    private readonly productService: ProductService,
    private readonly productImageService: ProductImageService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
  ) {
  }

  @Get('/:id/images')
  @Authenticated()
  @ApiResponse({ status: OK })
  @ApiResponse({ status: NOT_FOUND, type: ApiNotFoundException })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
  public async getImage(@Param('id') id: number, @Authed() user: User): Promise<ProductImage[]> {
    const product = await this.productService.get({ id, user });
    return await this.productImageService.findMany({ product });
  }

  @Post('/:id/images')
  @UseInterceptors(FileInterceptor('file'))
  @Authenticated()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({ status: BAD_REQUEST, type: ApiBadRequestException })
  @ApiResponse({ status: NOT_FOUND, type: ApiNotFoundException })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
  public async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: UploadImageDto,
    @Authed() user: User,
  ): Promise<ProductImage> {
    if (file == null) {
      throw new BadRequestException('No image provided');
    }

    const product = await this.productService.get({ id, user });

    try {
      const image = await this.productImageService.format(file.buffer);
      const fileName = await this.productImageService.createFileName(image);
      const contentType = await this.productImageService.getContentType(image);
      const path = `${this.STORAGE_FOLDER}/${fileName}`;

      const productImage = new ProductImage();
      productImage.name = fileName;
      productImage.path = `${this.storageService.getCdnUrl()}/${this.STORAGE_FOLDER}`;
      productImage.product = product;

      await this.storageService.upload(path, image, contentType);

      return await this.productImageService.save(productImage);
    } catch (error) {
      if (error instanceof UnsupportedImageTypeException) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Delete('/:id/images/:imageId')
  @Authenticated()
  @ApiResponse({ status: NO_CONTENT })
  @ApiResponse({ status: NOT_FOUND, type: ApiNotFoundException })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
  public async deleteImage(
    @Param('id') id: number,
    @Param('imageId') imageId: number,
    @Authed() user: User,
  ): Promise<ProductImage> {
    const product = await this.productService.get({ id, user });
    const image = await this.productImageService.get({ id: imageId, product });
    const path = `${this.STORAGE_FOLDER}/${image.name}`;

    await this.productImageService.delete(image, false);
    await this.storageService.delete(path);

    return image;
  }
}
