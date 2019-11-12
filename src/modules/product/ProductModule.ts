import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './controllers/ProductController';
import { ProductImageController } from './controllers/ProductImageController';
import { Product } from './domain/Product';
import { ProductImageService } from './services/ProductImageService';
import { ProductService } from './services/ProductService';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController, ProductImageController],
  providers: [ProductService, ProductImageService],
  exports: [ProductService],
})
export class ProductModule {
}
