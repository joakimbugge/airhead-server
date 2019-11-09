import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  public amount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  public amountThreshold: number;
}
