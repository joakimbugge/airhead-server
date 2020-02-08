import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateProductDto } from './CreateProductDto';

export class UpdateProductDto extends CreateProductDto {
  @IsNotEmpty()
  @IsNumber()
  public id: number;
}
