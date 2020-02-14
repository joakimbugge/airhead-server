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
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { BAD_REQUEST, NO_CONTENT, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import * as path from 'path';
import { ApiBadRequestException } from '../../../../doc/exceptions/ApiBadRequestException';
import { ApiNotFoundException } from '../../../../doc/exceptions/ApiNotFoundException';
import { ApiUnauthorizedException } from '../../../../doc/exceptions/ApiUnauthorizedException';
import { Authed } from '../../../server/decorators/Authed';
import { Authenticated } from '../../../server/decorators/Authenticated';
import { UnsupportedImageTypeException } from '../../../server/exceptions/UnsupportedImageTypeException';
import { ConfigService } from '../../config/services/ConfigService';
import { User } from '../../user/domain/User';
import { UploadImageDto } from '../dtos/UploadImageDto';
import { ProductImageService } from '../services/ProductImageService';
import { ProductService } from '../services/ProductService';

@Controller('products')
@ApiTags('product images')
export class ProductImageController {
  constructor(
    private readonly productService: ProductService,
    private readonly productImageService: ProductImageService,
    private readonly configService: ConfigService,
  ) {
  }

  @Get('/:id/image')
  @Authenticated()
  @ApiResponse({ status: OK })
  @ApiResponse({ status: NOT_FOUND, type: ApiNotFoundException })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
  public async getImage(@Param('id') id: number, @Authed() user: User, @Res() response: Response) {
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({ status: NO_CONTENT })
  @ApiResponse({ status: BAD_REQUEST, type: ApiBadRequestException })
  @ApiResponse({ status: NOT_FOUND, type: ApiNotFoundException })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
  public async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: UploadImageDto,
    @Authed() user: User,
  ): Promise<void> {
    if (file == null) {
      throw new BadRequestException('No image provided');
    }

    const product = await this.productService.get({ id, user });

    try {
      const image = await this.productImageService.format(file.buffer);
      const fileName = await this.productImageService.save(image); // Save image to disk

      await this.productService.save({ ...product, image: fileName }); // Add image to product
    } catch (e) {
      if (e instanceof UnsupportedImageTypeException) {
        throw new BadRequestException(e.message);
      }

      throw new InternalServerErrorException();
    }
  }

  @Delete('/:id/image')
  @HttpCode(NO_CONTENT)
  @Authenticated()
  @ApiResponse({ status: NO_CONTENT })
  @ApiResponse({ status: NOT_FOUND, type: ApiNotFoundException })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
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
