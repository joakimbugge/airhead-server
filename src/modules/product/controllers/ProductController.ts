import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Authed } from '../../../server/decorators/Authed';
import { Authenticated } from '../../../server/decorators/Authenticated';
import { User } from '../../user/domain/User';
import { FuzzySearchItem } from '../domain/FuzzySearchItem';
import { Product } from '../domain/Product';
import { CreateProductDto } from '../dtos/CreateProductDto';
import { UpdateProductDto } from '../dtos/UpdateProductDto';
import { ProductService } from '../services/ProductService';

@Controller('products')
export class ProductController {
  private MINE_TERM_LENGTH = 3;
  private MIN_LIKENESS = 10;

  constructor(private readonly productService: ProductService) {
  }

  @Get('/')
  @Authenticated()
  public findMany(@Authed() user: User): Promise<Product[]> {
    return this.productService.findMany({ user });
  }

  @Get('/search')
  @Authenticated()
  public search(
    @Query('term') term: string,
    @Query('minLikeness', new ParseIntPipe()) minLikeness = this.MIN_LIKENESS,
    @Authed() user: User): Promise<Array<FuzzySearchItem<Product>>> {

    if (!term || term.length < this.MINE_TERM_LENGTH) {
      throw this.createSearchValidationError();
    }

    return this.productService.search(term, user, minLikeness);
  }

  @Get('/:id')
  @Authenticated()
  public get(@Param('id', new ParseIntPipe()) id: number, @Authed() user: User): Promise<Product> {
    return this.productService.get({ id, user });
  }

  @Post('/')
  @Authenticated()
  public create(@Body() createProductDto: CreateProductDto, @Authed() user: User): Promise<Product> {
    const product = new Product();

    product.name = createProductDto.name;
    product.amount = createProductDto.amount;
    product.amountThreshold = createProductDto.amountThreshold;
    product.user = user;

    return this.productService.save(product);
  }

  @Put('/:id')
  @Authenticated()
  public async update(@Param('id', new ParseIntPipe()) id: number,
                      @Body() updateProductDto: UpdateProductDto,
                      @Authed() user: User): Promise<Product> {
    const product = await this.productService.get({ id, user });

    product.name = updateProductDto.name;
    product.amount = updateProductDto.amount;
    product.amountThreshold = updateProductDto.amountThreshold;

    return this.productService.save(product);
  }

  @Delete('/:id')
  @Authenticated()
  public async delete(@Param('id', new ParseIntPipe()) id: number, @Authed() user: User): Promise<Product> {
    const product = await this.productService.get({ id }, { relations: ['user'] });

    // Hides the fact that someone else is owning the product
    if (product.user.id !== user.id) {
      throw new NotFoundException();
    }

    return this.productService.delete(product);
  }

  private createSearchValidationError(): ValidationError {
    const error = new ValidationError();

    error.property = 'term';
    error.constraints = { minLength: `Has to contain at least ${this.MINE_TERM_LENGTH} characters` };
    error.children = [];

    throw error;
  }
}
