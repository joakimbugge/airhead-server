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
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import { BAD_REQUEST, CREATED, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import { ApiBadRequestException } from '../../../../doc/exceptions/ApiBadRequestException';
import { ApiNotFoundException } from '../../../../doc/exceptions/ApiNotFoundException';
import { ApiUnauthorizedException } from '../../../../doc/exceptions/ApiUnauthorizedException';
import { Authed } from '../../../server/decorators/Authed';
import { Authenticated } from '../../../server/decorators/Authenticated';
import { User } from '../../user/domain/User';
import { FuzzySearchItem } from '../domain/FuzzySearchItem';
import { Product } from '../domain/Product';
import { CreateProductDto } from '../dtos/CreateProductDto';
import { UpdateProductDto } from '../dtos/UpdateProductDto';
import { ProductService } from '../services/ProductService';

@Controller('products')
@ApiTags('products')
export class ProductController {
  private readonly MINE_TERM_LENGTH = 3;
  private readonly MIN_LIKENESS = 10;

  constructor(private readonly productService: ProductService) {
  }

  @Get('/')
  @Authenticated()
  @ApiResponse({ status: OK, type: [Product] })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
  public findMany(@Authed() user: User): Promise<Product[]> {
    return this.productService.findMany({ user });
  }

  @Get('/search')
  @Authenticated()
  @ApiQuery({ name: 'minLikeness', required: false, type: Number })
  @ApiResponse({ status: OK, type: [FuzzySearchItem] })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
  public search(
    @Query('term') term: string,
    @Query('minLikeness', new ParseIntPipe()) minLikeness = this.MIN_LIKENESS,
    @Authed() user: User,
  ): Promise<FuzzySearchItem<Product>[]> {
    if (!term || term.length < this.MINE_TERM_LENGTH) {
      throw this.createSearchValidationError();
    }

    return this.productService.search(term, user, minLikeness);
  }

  @Get('/:id')
  @Authenticated()
  @ApiResponse({ status: OK, type: Product })
  @ApiResponse({ status: NOT_FOUND, type: ApiNotFoundException })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
  public get(@Param('id', new ParseIntPipe()) id: number, @Authed() user: User): Promise<Product> {
    return this.productService.get({ id, user });
  }

  @Post('/')
  @Authenticated()
  @ApiResponse({ status: CREATED, type: Product })
  @ApiResponse({ status: BAD_REQUEST, type: ApiBadRequestException })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
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
  @ApiResponse({ status: OK, type: Product })
  @ApiResponse({ status: BAD_REQUEST, type: ApiBadRequestException })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
  public async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Authed() user: User,
  ): Promise<Product> {
    const product = await this.productService.get({ id, user });

    product.name = updateProductDto.name;
    product.amount = updateProductDto.amount;
    product.amountThreshold = updateProductDto.amountThreshold;

    return this.productService.save(product);
  }

  @Delete('/:id')
  @Authenticated()
  @ApiResponse({ status: OK, type: Product })
  @ApiResponse({ status: NOT_FOUND, type: ApiNotFoundException })
  @ApiResponse({ status: UNAUTHORIZED, type: ApiUnauthorizedException })
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
